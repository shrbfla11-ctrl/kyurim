import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import type { ScanOutcome } from "@/lib/scan/types";

export const runtime = "nodejs";

type Match = { outcome: ScanOutcome; serial: string | null; score: number | null };

// 패턴 매칭 엔진 자리입니다. 지금은 이미지 해시로 결과를 정하고, 등록된 스티커 중 하나를 임의로 골라 화면 흐름만 검증합니다.
// 엔진이 준비되면 이 함수 안에서 외부 API 호출 또는 자체 대조 로직으로 교체합니다.
async function matchPattern(image: Blob, pickSerial: () => Promise<string | null>): Promise<Match> {
  const buf = Buffer.from(await image.arrayBuffer());
  const hash = createHash("sha256").update(buf).digest();
  const bucket = hash[0] % 10;
  const outcome: ScanOutcome = bucket < 7 ? "genuine" : bucket < 9 ? "unverified" : "fake";
  const serial = outcome === "unverified" ? null : await pickSerial();
  const score = outcome === "genuine" ? 0.9 + (hash[1] % 10) / 100 : outcome === "fake" ? (hash[1] % 30) / 100 : null;
  return { outcome, serial, score };
}

/** Vercel 이 붙여 주는 IP 기반 지역 헤더. 없으면 null. */
function regionFrom(req: NextRequest) {
  const city = req.headers.get("x-vercel-ip-city");
  const region = req.headers.get("x-vercel-ip-country-region");
  const parts = [region, city].filter(Boolean).map((v) => decodeURIComponent(v as string));
  return parts.length ? parts.join(" ") : null;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const image = form?.get("image");
  if (!(image instanceof Blob) || image.size === 0) {
    return NextResponse.json({ error: "이미지가 없어요." }, { status: 400 });
  }
  if (image.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "이미지가 너무 커요." }, { status: 413 });
  }

  const match = await matchPattern(image, async () => (await supabase.rpc("pick_placeholder_sticker")).data ?? null);
  // 촬영 이미지는 여기서 응답 후 버려지며 어디에도 저장하지 않습니다.
  const { data: id, error } = await supabase.rpc("record_scan", {
    p_serial: match.serial,
    p_outcome: match.outcome,
    p_score: match.score,
    p_region: regionFrom(request),
  });
  if (error || !id) return NextResponse.json({ error: "기록을 저장하지 못했어요." }, { status: 500 });
  return NextResponse.json({ id, outcome: match.outcome });
}
