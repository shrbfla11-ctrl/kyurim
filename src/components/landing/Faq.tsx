"use client";

import { useState } from "react";

const faq = [
  {
    q: "알약이 인식되지 않으면 어떻게 하나요?",
    a: "밝은 곳에서 알약의 식별 문자가 잘 보이도록 다시 촬영해 주세요. 그래도 인식되지 않으면 식별 문자나 색상·모양으로 직접 검색하실 수 있어요.",
  },
  {
    q: "촬영한 사진은 저장되나요?",
    a: "아니요. 사진은 인식 처리 직후 삭제되며 서버에 보관되지 않아요. 복약 기록 저장을 선택한 경우에만 결과 정보가 내 기기에 저장돼요.",
  },
  {
    q: "의사·약사 상담을 대신할 수 있나요?",
    a: "아니요. PUF가 제공하는 정보는 참고용이에요. 복용 여부와 용량은 반드시 의사 또는 약사와 상담해 주세요.",
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
