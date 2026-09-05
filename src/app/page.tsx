import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function checkSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return { ok: false, message: "환경변수(NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)가 설정되지 않았습니다." };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();
    if (error) return { ok: false, message: error.message };
    const res = await fetch(`${url}/auth/v1/health`, { headers: { apikey: key }, cache: "no-store" });
    if (!res.ok) return { ok: false, message: `REST 응답 ${res.status}: ${(await res.text()).slice(0, 300)}` };
    return { ok: true, message: `연결 성공 (${new URL(url).host})` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

export default async function Home() {
  const status = await checkSupabase();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">kyurim</h1>
      <p className={status.ok ? "text-green-600" : "text-red-600"}>
        Supabase: {status.message}
      </p>
    </main>
  );
}
