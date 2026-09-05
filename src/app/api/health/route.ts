import { NextResponse } from "next/server";

// Supabase 연결 상태 확인용 엔드포인트 (GET /api/health)
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { ok: false, message: "Supabase 환경변수가 설정되지 않았습니다." },
      { status: 500 },
    );
  }
  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, message: `Supabase 응답 ${res.status}` },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, host: new URL(url).host });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : String(e) },
      { status: 502 },
    );
  }
}
