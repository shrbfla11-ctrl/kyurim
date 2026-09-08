import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enroll } from "@/lib/puf";
import { parseFrames } from "@/lib/puf/frames";

export const runtime = "nodejs";

/** 스티커 등록(관리자): 프레임 묶음에서 서명을 뽑아 해당 시리얼에 저장합니다. */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return NextResponse.json({ error: "관리자만 등록할 수 있어요." }, { status: 403 });

  const form = await request.formData().catch(() => null);
  const serial = String(form?.get("serial") ?? "").trim().toUpperCase();
  if (!serial) return NextResponse.json({ error: "스티커 시리얼을 입력해 주세요." }, { status: 400 });
  const parsed = await parseFrames(form);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: parsed.status });

  const signature = await enroll(parsed.frames, parsed.timestamps);
  if (signature.beads.length === 0) return NextResponse.json({ error: "비즈를 찾지 못했어요. 어두운 곳에서 다시 촬영해 주세요." }, { status: 422 });

  const { error } = await supabase.rpc("enroll_sticker", { p_serial: serial, p_signature: JSON.parse(JSON.stringify(signature)) });
  if (error) {
    const notFound = error.message.includes("not found");
    return NextResponse.json({ error: notFound ? "해당 시리얼의 스티커가 없어요." : "등록에 실패했어요." }, { status: notFound ? 404 : 500 });
  }
  return NextResponse.json({ ok: true, serial, beads: signature.beads.length, frameCount: signature.frameCount });
}
