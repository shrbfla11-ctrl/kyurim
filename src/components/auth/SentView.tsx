"use client";

import { useState } from "react";
import { CheckIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";

// 메일 발송 완료 화면 (비밀번호 재설정, 가입 인증 공용)
export function SentView({
  title,
  email,
  description,
  resend,
}: {
  title: string;
  email: string;
  description: string;
  resend: () => Promise<void>;
}) {
  const [resent, setResent] = useState(false);

  return (
    <div className="flex flex-1 flex-col justify-between gap-8 lg:flex-none">
      <div className="flex flex-col items-center gap-6 pt-4 text-center">
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-green-light text-green">
          <CheckIcon size={36} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em]">{title}</h1>
          <p className="mt-3 text-[15px] leading-normal text-gray-5">
            <strong className="font-semibold text-ink">{email}</strong>로 링크를 보냈어요.
            <br />
            {description}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <Button href="/login" full>로그인으로 돌아가기</Button>
        <p className="text-center text-sm text-gray-5">
          {resent ? (
            "메일을 다시 보냈어요."
          ) : (
            <>
              메일이 오지 않았나요?{" "}
              <button
                type="button"
                onClick={async () => {
                  await resend();
                  setResent(true);
                }}
                className="font-bold text-blue"
              >
                다시 보내기
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
