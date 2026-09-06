import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "비밀번호 찾기 - PUF" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      panel={{
        title: (
          <>
            걱정하지 마세요,
            <br />
            금방 다시 시작할 수 있어요
          </>
        ),
        description:
          "이메일로 보내드리는 링크는 10분 동안 유효해요. 링크가 만료되면 다시 요청하실 수 있어요.",
      }}
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
