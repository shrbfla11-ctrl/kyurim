// 인증 폼 공용 검증 규칙. 오류 문구는 필드 아래 인라인으로 표시됩니다.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PW_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export function validateEmail(v: string): string | undefined {
  if (!v.trim()) return "이메일을 입력해 주세요.";
  if (!EMAIL_RE.test(v.trim())) return "올바른 이메일 형식이 아니에요.";
}

export function validatePassword(v: string): string | undefined {
  if (!v) return "비밀번호를 입력해 주세요.";
}

export function validateNewPassword(v: string): string | undefined {
  if (!v) return "비밀번호를 입력해 주세요.";
  if (!PW_RE.test(v)) return "영문과 숫자를 포함해 8자 이상 입력해 주세요.";
}

export function validatePasswordConfirm(pw: string, confirm: string): string | undefined {
  if (!confirm) return "비밀번호를 다시 입력해 주세요.";
  if (pw !== confirm) return "비밀번호가 일치하지 않아요.";
}

export function validateName(v: string): string | undefined {
  if (!v.trim()) return "이름을 입력해 주세요.";
}

export function isValidNewPassword(v: string) {
  return PW_RE.test(v);
}

// 오류 객체에서 undefined 를 걷어내고, 남은 오류가 있는지 알려줍니다.
export function collect<T extends Record<string, string | undefined>>(errors: T) {
  const cleaned = Object.fromEntries(Object.entries(errors).filter(([, v]) => v)) as Partial<T>;
  return { errors: cleaned, hasError: Object.keys(cleaned).length > 0 };
}
