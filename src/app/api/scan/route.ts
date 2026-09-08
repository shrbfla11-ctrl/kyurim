import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import type { ScanOutcome } from "@/lib/scan/types";
import { clampSettings } from "@/lib/scan/capture";

export const runtime = "nodejs";

type Match = { outcome: ScanOutcome; serial: string | null; score: number | null };

/** 촬영 프레임 묶음. 플래시를 끈 직후부터 timestamps(ms) 간격으로 찍힌 순서입니다. */
export type FrameBundle = { frames: Blob[]; timestamps: number[] };

// 패턴 매칭 엔진 자리입니다. 지금은 첫 프레임 해시로 결과를 정하고, 등록된 스티커 중 하나를 임의로 골라 화면 흐름만 검증합니다.
// 엔진(감쇠 곡선 대조)이 준비되면 이 함수 안에서 외부 API 호출 또는 자체 대조 로직으로 교체합니다.
async function matchPattern(bundle: FrameBundle, pickSerial: () => Promise<string | null>): Promise<Match> {
  const buf = Buffer.from(await bundle.frames[0].arrayBuffer());
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
  const frames = (form?.getAll("frames") ?? []).filter((f): f is File => f instanceof File && f.size > 0);
  if (frames.length === 0) {
    return NextResponse.json({ error: "이미지가 없어요." }, { status: 400 });
  }
  const total = frames.reduce((n, f) => n + f.size, 0);
  if (frames.length > 30 || total > 40 * 1024 * 1024) {
    return NextResponse.json({ error: "이미지가 너무 커요." }, { status: 413 });
  }
  let timestamps: number[] = [];
  try {
    const parsed = JSON.parse(String(form?.get("timestamps") ?? "[]"));
    if (Array.isArray(parsed)) timestamps = parsed.map((n) => Number(n) || 0);
  } catch {
    /* 없으면 0 부터 순서대로 */
  }
  if (timestamps.length !== frames.length) timestamps = frames.map((_, i) => i * 200);
  // 갤러리 업로드(단일 이미지)는 촬영 조건이 없으므로 null 로 남깁니다.
  const hasConditions = form?.get("chargeMs") != null;
  const conditions = hasConditions
    ? clampSettings({ chargeMs: Number(form?.get("chargeMs")), frameCount: Number(form?.get("frameCount")), frameIntervalMs: Number(form?.get("frameIntervalMs")) })
    : null;

  const match = await matchPattern({ frames, timestamps }, async () => (await supabase.rpc("pick_placeholder_sticker")).data ?? null);
  // 촬영 이미지는 여기서 응답 후 버려지며 어디에도 저장하지 않습니다.
  const { data: id, error } = await supabase.rpc("record_scan", {
    p_serial: match.serial,
    p_outcome: match.outcome,
    p_score: match.score,
    p_region: regionFrom(request),
    p_charge_ms: conditions?.chargeMs ?? null,
    p_frame_count: conditions ? frames.length : null,
    p_frame_interval_ms: conditions?.frameIntervalMs ?? null,
  });
  if (error || !id) return NextResponse.json({ error: "기록을 저장하지 못했어요." }, { status: 500 });
  return NextResponse.json({ id, outcome: match.outcome });
}
