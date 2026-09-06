import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "회원가입 - PUF" };

export default function SignupPage() {
  return (
    <AuthShell
      panel={{
        title: (
          <>
            가입하면
            <br />
            이런 것들이 가능해요
          </>
        ),
        bullets: [
          "인증한 제품을 스캔 기록에 자동 저장",
          "위조·재사용 스티커 감지 시 즉시 경고",
          "제조사는 관리자 페이지에서 제품·스티커 관리",
        ],
      }}
    >
      <SignupForm />
    </AuthShell>
  );
}
