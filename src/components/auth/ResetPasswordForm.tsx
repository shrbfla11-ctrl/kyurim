"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { BackIcon } from "@/components/icons";
import { FormError, PrimaryButton, TextField } from "./fields";
import { SentView } from "./SentView";
import { validateEmail } from "./validate";

async function sendResetMail(email: string) {
  const supabase = createClient();
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
  });
}

export function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const err = validateEmail(email);
    setEmailError(err);
    if (err) return;

    setLoading(true);
    const { error } = await sendResetMail(email.trim());
    setLoading(false);
    if (error) {
      setFormError("메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요.");
      return;
    }
    setSentTo(email.trim());
  }

  if (sentTo) {
    return (
      <SentView
        title="메일을 보냈어요"
        email={sentTo}
        description="10분 안에 메일의 링크를 눌러 새 비밀번호를 설정해 주세요."
        resend={async () => {
          await sendResetMail(sentTo);
        }}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8">
      <div>
        <h1 className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em]">비밀번호를 잊으셨나요?</h1>
        <p className="mt-2 text-[15px] leading-normal text-gray-5">
          가입한 이메일을 입력하시면 비밀번호 재설정 링크를 보내드려요.
        </p>
      </div>
      <TextField
        label="이메일"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="example@puf.kr"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (emailError) setEmailError(undefined);
        }}
        error={emailError}
      />
      {formError && <FormError>{formError}</FormError>}
      <div className="flex flex-col gap-6">
        <PrimaryButton type="submit" loading={loading} loadingLabel="보내는 중...">재설정 링크 보내기</PrimaryButton>
        <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-5">
          <BackIcon size={16} />
          로그인으로 돌아가기
        </Link>
      </div>
    </form>
  );
}
