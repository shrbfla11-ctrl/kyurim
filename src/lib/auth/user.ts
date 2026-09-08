import { createClient } from "@/lib/supabase/server";
import type { UserSummary } from "@/components/auth/UserMenu";

// 서버 컴포넌트에서 현재 로그인 사용자 요약을 가져옵니다. 미로그인 시 null.
// 이름·마케팅 수신·권한은 profiles 테이블이 기준이고, 소셜 메타데이터는 보조로 씁니다.
export async function getUserSummary(): Promise<UserSummary | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role, name, marketing_opt_in, avatar_url").eq("id", user.id).maybeSingle();
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
    id: user.id,
    email: user.email ?? null,
    name: profile?.name ?? pick("name", "full_name", "preferred_username", "nickname"),
    avatarUrl: profile?.avatar_url ?? pick("avatar_url", "picture"),
    customAvatar: !!profile?.avatar_url,
    isAdmin: profile?.role === "admin",
    providers: ((user.app_metadata?.providers as string[] | undefined) ?? []).filter(Boolean),
    marketingOptIn: profile?.marketing_opt_in ?? meta.marketing_opt_in === true,
  };
}
