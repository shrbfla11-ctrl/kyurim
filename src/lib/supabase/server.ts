import { createServerClient } from "@supabase/ssr";
import type { Database } from "./types";
import { cookies } from "next/headers";

// 서버 컴포넌트 / Route Handler / Server Action 에서 사용하는 Supabase 클라이언트
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 서버 컴포넌트에서 호출된 경우 쿠키 쓰기가 불가하므로 무시
          }
        },
      },
    },
  );
}
