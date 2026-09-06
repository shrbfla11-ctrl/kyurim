// 관리자 판별. MVP 단계에서는 이메일로 구분하고, 이후 역할 테이블/JWT 클레임으로 교체합니다.
export const ADMIN_EMAILS = ["admin@puf.com"];

export function isAdminEmail(email: string | null | undefined) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
