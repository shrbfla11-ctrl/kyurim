import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "로그인 - PUF" };

export default function LoginPage() {
  return (
    <AuthShell
      panel={{
        title: (
          <>
            카메라를 스티커에 비추면
            <br />
            정품인지 바로 알 수 있어요
          </>
        ),
        description:
          "복제 불가능한 패턴 스티커로 진위를 판별하고, 인증한 제품의 정보와 스캔 기록을 한 곳에서 확인하세요.",
        badges: ["촬영 이미지 미저장", "복제 불가 패턴"],
      }}
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
