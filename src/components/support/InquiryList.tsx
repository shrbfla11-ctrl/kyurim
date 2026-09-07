"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareText, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Inquiry } from "@/lib/support/content";
import { addInquiryMessage } from "@/lib/support/actions";

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

/** 문의 상세: 헤더 카드 + 말풍선 대화 + 추가 문의 입력 */
export function InquiryDetail({ inquiry }: { inquiry: Inquiry }) {
  const router = useRouter();
  const messages = inquiry.messages;
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const s = statusPill[inquiry.status];

  async function send() {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    setError(null);
    const res = await addInquiryMessage(inquiry.id, body);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setText("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={`${card} p-6`}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-semibold text-gray-4">{inquiry.category} · <span className="font-inter">{inquiry.ticket}</span></span>
          <span className={`flex-none rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span>
        </div>
        <h1 className="mt-2.5 text-xl font-bold leading-[1.3] tracking-[-0.03em] lg:text-2xl">{inquiry.subject}</h1>
      </div>

      <div className="flex flex-col gap-4 py-2">
        {messages.map((m) =>
          m.from === "user" ? (
            <div key={m.id} className="flex flex-col items-end gap-1.5">
              <div className="max-w-full whitespace-pre-line rounded-[20px_20px_4px_20px] bg-blue px-[18px] py-3.5 text-[15px] leading-relaxed text-white lg:max-w-[560px]">{m.body}</div>
              {m.attachments.length > 0 && (
                <div className="flex gap-1.5">
                  {m.attachments.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer" className="block h-[72px] w-[72px] overflow-hidden rounded-xl bg-gray-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="첨부 이미지" className="h-full w-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
              <span className="font-inter text-xs text-gray-4">{m.at}</span>
            </div>
          ) : (
            <div key={m.id} className="flex items-end gap-2.5">
              <span className="flex h-8 w-8 flex-none items-center justify-center overflow-hidden rounded-full border border-gray-2 bg-white">
                <Image src="/puf-logo.png" alt="PUF" width={951} height={598} className="h-3 w-auto" />
              </span>
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-gray-6">PUF 고객센터</span>
                <div className="max-w-full whitespace-pre-line rounded-[20px_20px_20px_4px] bg-white px-[18px] py-3.5 text-[15px] leading-relaxed text-ink shadow-card lg:max-w-[560px]">{m.body}</div>
                <span className="font-inter text-xs text-gray-4">{m.at}</span>
              </div>
            </div>
          ),
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className={`${card} flex items-center gap-3 py-3 pl-5 pr-3`}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={error ?? "추가 문의를 남겨 주세요"} className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none" />
        <button type="submit" aria-label="보내기" disabled={busy} className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-blue text-white transition duration-300 hover:bg-blue-dark disabled:opacity-50">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
