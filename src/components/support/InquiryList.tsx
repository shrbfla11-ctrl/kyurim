"use client";

import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { InquiryThread } from "@/components/support/InquiryThread";
import type { Inquiry } from "@/lib/support/content";

const card = "rounded-[20px] bg-white shadow-card";

const statusPill = {
  wait: { label: "답변 대기", cls: "bg-amber-bg text-amber-dark" },
  done: { label: "답변 완료", cls: "bg-green-light text-green" },
};

/** 문의 내역 목록. selectedId 가 있으면 데스크톱에서 해당 항목이 강조됩니다. */
export function InquiryList({ items, selectedId }: { items: Inquiry[]; selectedId?: string }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em] lg:text-[32px]">문의 내역</h1>
          <p className="mt-1.5 text-[15px] text-gray-5">
            남긴 문의와 답변을 확인할 수 있어요.{" "}
            <Link href="/support" className="font-semibold text-blue hover:underline">자주 묻는 질문 보기</Link>
          </p>
        </div>
        <Button href="/support/inquiry" size="md" className="flex-none">새 문의</Button>
      </div>

      {items.length === 0 ? (
        <div className={`${card} flex flex-col items-center gap-5 px-6 py-14 text-center`}>
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-light text-blue"><MessageSquareText size={40} /></span>
          <div>
            <div className="text-lg font-bold">아직 문의 내역이 없어요</div>
            <p className="mt-2 text-[15px] leading-relaxed text-gray-5">궁금한 점이 있다면 먼저 자주 묻는 질문을 확인해 보세요.</p>
          </div>
          <div className="flex gap-2">
            <Button href="/support" variant="ghost" size="md" className="bg-gray-1 text-gray-6">자주 묻는 질문</Button>
            <Button href="/support/inquiry" size="md">문의하기</Button>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((it) => {
            const s = statusPill[it.status];
            const on = it.id === selectedId;
            return (
              <li key={it.id}>
                <Link
                  href={`/support/inquiries?id=${it.id}`}
                  className={`block rounded-[20px] bg-white px-6 py-5 text-ink shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${on ? "ring-2 ring-blue" : ""}`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-[13px] font-semibold text-gray-4">{it.category} · <span className="font-inter">{it.date}</span></span>
                    <span className={`flex-none rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span>
                  </span>
                  <span className="mt-2 block text-base font-bold leading-normal">{it.subject}</span>
                  <span className="mt-1 block truncate text-sm leading-normal text-gray-5">{it.preview}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** 문의 상세: 헤더 카드 + 대화 스레드 + 추가 문의 입력 */
export function InquiryDetail({ inquiry }: { inquiry: Inquiry }) {
  const s = statusPill[inquiry.status];
  return (
    <div className="flex flex-col gap-4">
      <div className={`${card} p-6`}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-semibold text-gray-4">{inquiry.category} · <span className="font-inter">{inquiry.ticket}</span></span>
          <span className={`flex-none rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span>
        </div>
        <h1 className="mt-2.5 text-xl font-bold leading-[1.3] tracking-[-0.03em] lg:text-2xl">{inquiry.subject}</h1>
      </div>
      <InquiryThread inquiry={inquiry} viewer="user" placeholder="추가 문의를 남겨 주세요" />
    </div>
  );
}
