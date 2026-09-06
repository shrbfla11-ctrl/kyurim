"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Checkbox, FormError, PasswordField, PrimaryButton, SuccessText, TextField } from "./fields";
import { SentView } from "./SentView";

const PW_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [agree, setAgree] = useState({ terms: true, privacy: true, marketing: false });
  const [sentTo, setSentTo] = useState<string | null>(null);

  const pwValid = PW_RULE.test(password);
  const pwMismatch = password2.length > 0 && password !== password2;
  const allAgreed = agree.terms && agree.privacy && agree.marketing;

  function setAll(v: boolean) {
    setAgree({ terms: v, privacy: v, marketing: v });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError(null);
    setFormError(null);
    if (!pwValid) return setFormError("비밀번호는 영문과 숫자를 포함해 8자 이상이어야 해요.");
    if (password !== password2) return setFormError("비밀번호가 일치하지 않아요.");
    if (!agree.terms || !agree.privacy) return setFormError("필수 약관에 동의해 주세요.");

    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const name = String(form.get("name") ?? "").trim();
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, marketing_opt_in: agree.marketing },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (error) {
      if (/already|registered|exists/i.test(error.message)) {
        setEmailError("이미 가입된 이메일이에요. 로그인해 주세요.");
      } else {
        setFormError("가입 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.");
      }
      return;
    }
    // Supabase 는 이미 가입된 이메일이면 identities 가 빈 배열인 가짜 사용자를 돌려줍니다.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setEmailError("이미 가입된 이메일이에요. 로그인해 주세요.");
      return;
    }
    if (data.session) {
      router.replace("/");
      router.refresh();
      return;
    }
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <SentView
        title="인증 메일을 보냈어요"
        email={sentTo}
        description="메일의 링크를 눌러 가입을 완료해 주세요."
        resend={async () => {
          const supabase = createClient();
          await supabase.auth.resend({ type: "signup", email: sentTo });
        }}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <div>
        <h1 className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em]">PUF 시작하기</h1>
        <p className="mt-2 text-[15px] leading-normal text-gray-5">1분이면 가입할 수 있어요.</p>
      </div>

      <div className="flex flex-col gap-4">
        <TextField label="이름" name="name" autoComplete="name" placeholder="이름 입력" required />
        <TextField
          label="이메일"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="example@puf.kr"
          required
          error={emailError ?? undefined}
        />
        <PasswordField
          label="비밀번호"
          name="password"
          autoComplete="new-password"
          placeholder="영문·숫자 포함 8자 이상"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={pwValid ? <SuccessText>사용할 수 있는 비밀번호예요</SuccessText> : undefined}
        />
        <PasswordField
          label="비밀번호 확인"
          name="password2"
          autoComplete="new-password"
          placeholder="비밀번호 다시 입력"
          required
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          error={pwMismatch ? "비밀번호가 일치하지 않아요." : undefined}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl bg-gray-1 p-4">
        <div className="border-b border-gray-2 pb-3">
          <Checkbox strong checked={allAgreed} onChange={(e) => setAll(e.target.checked)}>전체 동의</Checkbox>
        </div>
        <Checkbox
          checked={agree.terms}
          onChange={(e) => setAgree({ ...agree, terms: e.target.checked })}
          right={<a href="#" className="text-[13px] text-gray-4">보기</a>}
        >
          <span><span className="font-semibold text-blue">[필수]</span> 이용약관 동의</span>
        </Checkbox>
        <Checkbox
          checked={agree.privacy}
          onChange={(e) => setAgree({ ...agree, privacy: e.target.checked })}
          right={<a href="#" className="text-[13px] text-gray-4">보기</a>}
        >
          <span><span className="font-semibold text-blue">[필수]</span> 개인정보처리방침 동의</span>
        </Checkbox>
        <Checkbox checked={agree.marketing} onChange={(e) => setAgree({ ...agree, marketing: e.target.checked })}>
          <span><span className="font-semibold text-gray-4">[선택]</span> 복약 알림·소식 수신 동의</span>
        </Checkbox>
      </div>

      {formError && <FormError>{formError}</FormError>}

      <div className="flex flex-col gap-6">
        <PrimaryButton type="submit" loading={loading} loadingLabel="가입 중...">가입하기</PrimaryButton>
        <p className="text-center text-sm text-gray-5">
          이미 계정이 있으신가요? <Link href="/login" className="font-bold">로그인</Link>
        </p>
      </div>
    </form>
  );
}
