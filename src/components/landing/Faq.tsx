"use client";

import { useState } from "react";

const faq = [
  {
    q: "스티커가 인식되지 않으면 어떻게 하나요?",
    a: "주변이 너무 밝으면 패턴이 흐리게 찍혀요. 손으로 그늘을 만들고 스티커 전체가 사각형 안에 들어오도록 맞춰 다시 촬영해 주세요. 스티커가 훼손되었거나 반복해서 실패하면 구매처에 문의해 주세요.",
  },
  {
    q: "촬영한 사진은 저장되나요?",
    a: "아니요. 사진은 인증 처리 직후 삭제되며 서버에 보관되지 않아요. 로그인 상태에서는 인증 결과만 스캔 기록에 저장돼요.",
  },
  {
    q: "정품이 아니라고 나오면 어떻게 하나요?",
    a: "패턴이 원본과 일치하지 않거나 같은 스티커가 이미 여러 번 스캔된 경우예요. 구매처나 제조사 고객센터에 인증 결과 화면과 함께 문의해 주세요.",
  },
  {
    q: "제조사인데 PUF를 도입하려면 어떻게 하나요?",
    a: "고객지원으로 문의해 주시면 제품 등록과 스티커 발급 절차를 안내드려요. 도입 후에는 관리자 페이지에서 스캔 현황을 확인할 수 있어요.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section id="faq" className="mx-auto w-full max-w-[1440px] px-6 pt-16 lg:px-20 lg:pt-24">
      <div className="lg:mx-auto lg:max-w-[800px]">
        <h2 className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em] lg:text-center lg:text-[32px]">
          자주 묻는 질문
        </h2>
        <div className="mt-2 lg:mt-6">
          {faq.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b border-gray-1">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-6 text-left"
                >
                  <span className="text-base font-semibold leading-snug text-ink lg:text-lg">{f.q}</span>
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-gray-1 text-lg text-gray-5">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="pb-6 text-[15px] leading-relaxed text-gray-5 lg:pr-12 lg:text-base">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
