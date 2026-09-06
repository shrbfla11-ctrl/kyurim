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
            카메라를 알약에 비추면
            <br />
            바로 알 수 있어요
          </>
        ),
        description:
          "식약처 공공데이터 기반으로 성분·효능·주의사항을 확인하고, 가족의 복약 기록까지 한 곳에서 관리하세요.",
        badges: ["사진 미저장", "인식 정확도 98.2%"],
      }}
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
