import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "crypto";
import type { ScanOutcome } from "@/lib/scan/mock";

export const runtime = "nodejs";

// 패턴 매칭 엔진 자리입니다. 지금은 이미지 해시로 결과를 정해 화면 흐름만 검증합니다.
// 엔진이 준비되면 이 함수 안에서 외부 API 호출 또는 자체 대조 로직으로 교체합니다.
async function matchPattern(image: Blob): Promise<{ outcome: ScanOutcome }> {
  const buf = Buffer.from(await image.arrayBuffer());
  const hash = createHash("sha256").update(buf).digest();
  const bucket = hash[0] % 10;
  const outcome: ScanOutcome = bucket < 7 ? "genuine" : bucket < 9 ? "unverified" : "fake";
  return { outcome };
}

export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const image = form?.get("image");
  if (!(image instanceof Blob) || image.size === 0) {
    return NextResponse.json({ error: "이미지가 없어요." }, { status: 400 });
  }
  if (image.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "이미지가 너무 커요." }, { status: 413 });
  }
  const result = await matchPattern(image);
  // 촬영 이미지는 여기서 응답 후 버려지며 어디에도 저장하지 않습니다.
  return NextResponse.json({ ...result, scannedAt: new Date().toISOString() });
}
