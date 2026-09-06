import { createClient } from "@/lib/supabase/server";
import type { UserSummary } from "@/components/auth/UserMenu";
import { displayNameFor, isAdminEmail } from "./admin";

// 서버 컴포넌트에서 현재 로그인 사용자 요약을 가져옵니다. 미로그인 시 null.
export async function getUserSummary(): Promise<UserSummary | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  return {
    email: user.email ?? null,
    name: (meta.name as string | undefined) ?? displayNameFor(user.email),
    avatarUrl: (meta.avatar_url as string | undefined) ?? null,
    isAdmin: isAdminEmail(user.email),
  };
}
