import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clampSettings } from "@/lib/scan/capture";
import { match, type Candidate, type Signature } from "@/lib/puf";
import { parseFrames } from "@/lib/puf/frames";

export const runtime = "nodejs";

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
  const parsed = await parseFrames(form);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: parsed.status });

  // 갤러리 업로드(단일 이미지)는 촬영 조건이 없으므로 null 로 남깁니다.
  const hasConditions = form?.get("chargeMs") != null;
  const conditions = hasConditions
    ? clampSettings({ chargeMs: Number(form?.get("chargeMs")), frameCount: Number(form?.get("frameCount")), frameIntervalMs: Number(form?.get("frameIntervalMs")) })
    : null;

  // 등록된 서명과 대조합니다. 촬영 이미지는 여기서 응답 후 버려지며 어디에도 저장하지 않습니다.
  const { data: rows } = await supabase.rpc("list_signatures");
  const candidates: Candidate[] = (rows ?? []).map((r) => ({ serial: r.serial, signature: r.signature as unknown as Signature }));
  const verdict = await match(parsed.frames, parsed.timestamps, candidates);

  const { data: id, error } = await supabase.rpc("record_scan", {
    p_serial: verdict.serial,
    p_outcome: verdict.outcome,
    p_score: verdict.score,
    p_region: regionFrom(request),
    p_charge_ms: conditions?.chargeMs ?? null,
    p_frame_count: conditions ? parsed.frames.length : null,
    p_frame_interval_ms: conditions?.frameIntervalMs ?? null,
    p_beads: verdict.beads,
    p_matched: verdict.matched,
  });
  if (error || !id) return NextResponse.json({ error: "기록을 저장하지 못했어요." }, { status: 500 });
  return NextResponse.json({ id, outcome: verdict.outcome, score: verdict.score, beads: verdict.beads, matched: verdict.matched });
}
