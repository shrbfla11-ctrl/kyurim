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
          "인식한 알약을 복약 기록에 자동 저장",
          "함께 먹으면 안 되는 약 상호작용 알림",
          "부모님·아이의 약까지 한 계정에서 관리",
        ],
      }}
    >
      <SignupForm />
    </AuthShell>
  );
}
