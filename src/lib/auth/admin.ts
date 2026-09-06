// 관리자 판별. MVP 단계에서는 이메일로 구분하고, 이후 역할 테이블/JWT 클레임으로 교체합니다.
export const ADMIN_EMAILS = ["admin@puf.com"];

// 대시보드에서 직접 만든 내부 계정의 표시 이름
const DISPLAY_NAMES: Record<string, string> = {
  "admin@puf.com": "PUF 관리자",
  "demo@puf.com": "PUF 테스트 계정",
};

export function isAdminEmail(email: string | null | undefined) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

export function displayNameFor(email: string | null | undefined) {
  return email ? DISPLAY_NAMES[email.toLowerCase()] ?? null : null;
}
