import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";

export const metadata: Metadata = { title: "비밀번호 변경 - PUF" };

export default function UpdatePasswordPage() {
  return (
    <AuthShell
      panel={{
        title: (
          <>
            새 비밀번호로
            <br />
            다시 시작해요
          </>
        ),
        description: "영문과 숫자를 포함해 8자 이상으로 설정해 주세요. 변경 후 바로 로그인돼요.",
      }}
    >
      <UpdatePasswordForm />
    </AuthShell>
  );
}
