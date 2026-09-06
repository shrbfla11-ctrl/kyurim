"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { FormError, PasswordField, PrimaryButton, SuccessText } from "./fields";
import { collect, isValidNewPassword, validateNewPassword, validatePasswordConfirm } from "./validate";

type Errors = { password?: string; password2?: string };

// 재설정 링크를 타고 들어온 뒤 새 비밀번호를 설정하는 화면
export function UpdatePasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setHasSession(!!data.session));
  }, []);

  function clear(key: keyof Errors) {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const v = collect<Errors>({
      password: validateNewPassword(password),
      password2: validatePasswordConfirm(password, password2),
    });
    setErrors(v.errors);
    if (v.hasError) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setFormError("비밀번호를 바꾸지 못했어요. 링크가 만료되었다면 다시 요청해 주세요.");
      return;
    }
    router.replace("/");
    router.refresh();
  }

  if (hasSession === false) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em]">링크가 만료되었어요</h1>
          <p className="mt-2 text-[15px] leading-normal text-gray-5">
            재설정 링크는 10분 동안만 유효해요. 다시 요청해 주세요.
          </p>
        </div>
        <a href="/reset-password" className="flex h-14 items-center justify-center rounded-2xl bg-blue text-[17px] font-bold text-white hover:bg-blue-dark">
          재설정 링크 다시 받기
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
      <div>
        <h1 className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em]">새 비밀번호 설정</h1>
        <p className="mt-2 text-[15px] leading-normal text-gray-5">앞으로 사용할 새 비밀번호를 입력해 주세요.</p>
      </div>
      <div className="flex flex-col gap-4">
        <PasswordField
          label="새 비밀번호"
          name="password"
          autoComplete="new-password"
          placeholder="영문·숫자 포함 8자 이상"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clear("password");
          }}
          error={errors.password}
          hint={isValidNewPassword(password) ? <SuccessText>사용할 수 있는 비밀번호예요</SuccessText> : undefined}
        />
        <PasswordField
          label="새 비밀번호 확인"
          name="password2"
          autoComplete="new-password"
          placeholder="비밀번호 다시 입력"
          value={password2}
          onChange={(e) => {
            setPassword2(e.target.value);
            clear("password2");
          }}
          error={errors.password2 ?? (password2 && password !== password2 ? "비밀번호가 일치하지 않아요." : undefined)}
        />
      </div>
      {formError && <FormError>{formError}</FormError>}
      <PrimaryButton
        type="submit"
        loading={loading || hasSession === null}
        loadingLabel={hasSession === null ? "확인 중..." : "변경 중..."}
      >
        비밀번호 변경
      </PrimaryButton>
    </form>
  );
}
