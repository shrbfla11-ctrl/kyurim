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
  // 공급자별로 메타데이터 키가 다릅니다. (이메일 가입: name / Google: name, picture / Kakao: full_name, preferred_username)
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      const v = meta[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return null;
  };
  return {
    email: user.email ?? null,
    name: pick("name", "full_name", "preferred_username", "nickname") ?? displayNameFor(user.email),
    avatarUrl: pick("avatar_url", "picture"),
    isAdmin: isAdminEmail(user.email),
    providers: ((user.app_metadata?.providers as string[] | undefined) ?? []).filter(Boolean),
    marketingOptIn: meta.marketing_opt_in === true,
  };
}
