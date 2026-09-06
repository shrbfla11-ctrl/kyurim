"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Checkbox, FormError, PasswordField, PrimaryButton, TextField } from "./fields";
import { SocialButtons } from "./SocialButtons";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "auth" ? "인증 링크가 만료되었거나 올바르지 않아요. 다시 시도해 주세요." : null,
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });
    if (error) {
      setError(
        error.message.includes("Email not confirmed")
          ? "이메일 인증이 아직 완료되지 않았어요. 받은 메일함을 확인해 주세요."
          : "이메일 또는 비밀번호가 올바르지 않아요.",
      );
      setLoading(false);
      return;
    }
    const next = params.get("next");
    router.replace(next && next.startsWith("/") ? next : "/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <div>
        <h1 className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em]">다시 만나서 반가워요</h1>
        <p className="mt-2 text-[15px] leading-normal text-gray-5">이메일로 로그인하거나 간편 로그인을 이용하세요.</p>
      </div>

      <div className="flex flex-col gap-4">
        <TextField label="이메일" name="email" type="email" autoComplete="email" placeholder="example@puf.kr" required />
        <PasswordField label="비밀번호" name="password" autoComplete="current-password" placeholder="비밀번호 입력" required />
        <div className="flex items-center justify-between">
          <Checkbox name="remember" defaultChecked>자동 로그인</Checkbox>
          <Link href="/reset-password" className="text-sm font-semibold text-gray-5">비밀번호 찾기</Link>
        </div>
        {error && <FormError>{error}</FormError>}
      </div>

      <div className="flex flex-col gap-6">
        <PrimaryButton type="submit" loading={loading} loadingLabel="로그인 중...">로그인</PrimaryButton>
        <div className="flex items-center gap-4 text-[13px] text-placeholder">
          <span className="h-px flex-1 bg-gray-2" />또는<span className="h-px flex-1 bg-gray-2" />
        </div>
        <SocialButtons />
        <p className="text-center text-sm text-gray-5">
          아직 계정이 없으신가요? <Link href="/signup" className="font-bold">회원가입</Link>
        </p>
      </div>
    </form>
  );
}
