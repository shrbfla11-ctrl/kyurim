"use server";

import { createClient } from "@/lib/supabase/server";

/** 회원 탈퇴. DB 함수가 본인 계정을 삭제하며, 성공하면 세션도 종료합니다. */
export async function deleteAccount(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요해요." };
  const { error } = await supabase.rpc("delete_my_account");
  if (error) {
    if (error.message.includes("admin")) return { ok: false, error: "관리자 계정은 탈퇴할 수 없어요. 먼저 관리자 권한을 해제해 주세요." };
    return { ok: false, error: "탈퇴 처리에 실패했어요. 잠시 후 다시 시도해 주세요." };
  }
  await supabase.auth.signOut();
  return { ok: true };
}
