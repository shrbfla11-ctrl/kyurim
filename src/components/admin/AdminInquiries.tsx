"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Pill, card } from "@/components/admin/ui";
import { InquiryThread } from "@/components/support/InquiryThread";
import type { Inquiry } from "@/lib/support/content";
import type { InquiryFilter } from "@/lib/support/data";
import { setInquiryStatus } from "@/lib/support/actions";

const filters: { key: InquiryFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "wait", label: "답변 대기" },
  { key: "done", label: "답변 완료" },
];
const statusPill = {
  wait: { label: "답변 대기", cls: "bg-amber-bg text-amber-dark" },
  done: { label: "답변 완료", cls: "bg-green-light text-green" },
};

/** 관리자 고객 지원: 문의 목록(좌) + 대화·답변(우) */
export function AdminInquiries({ items, filter, detail, counts }: { items: Inquiry[]; filter: InquiryFilter; detail: Inquiry | null; counts: Record<InquiryFilter, number> }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggleStatus() {
    if (!detail || busy) return;
    setBusy(true);
    await setInquiryStatus(detail.id, detail.status === "done" ? "wait" : "done");
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-[400px_1fr] items-start gap-6">
      <div className={`${card} overflow-hidden`}>
        <div className="flex gap-2 border-b border-gray-1 px-5 py-4">
          {filters.map((f) => {
            const on = filter === f.key;
            return (
              <Link
                key={f.key}
                href={`/admin/support?status=${f.key}`}
                className={`flex h-9 items-center rounded-full px-3.5 text-sm font-semibold transition-colors duration-300 ${on ? "bg-ink text-white" : "bg-gray-1 text-gray-6 hover:bg-gray-2"}`}
              >
                {f.label}<span className="ml-1.5 font-inter opacity-70">{counts[f.key]}</span>
              </Link>
            );
          })}
        </div>
        {items.length === 0 && <div className="px-6 py-16 text-center text-[15px] text-gray-4">해당 조건의 문의가 없어요.</div>}
        <ul className="max-h-[calc(100dvh-280px)] overflow-y-auto">
          {items.map((it) => {
            const s = statusPill[it.status];
            const on = it.id === detail?.id;
            return (
              <li key={it.id} className="border-b border-gray-1 last:border-0">
                <Link href={`/admin/support?status=${filter}&id=${it.id}`} className={`block px-5 py-4 transition-colors duration-300 hover:bg-[#F9FAFB] ${on ? "bg-blue-light/60" : ""}`}>
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate text-[13px] font-semibold text-gray-4">{it.user?.email ?? it.user?.name ?? "-"} · <span className="font-inter">{it.date}</span></span>
                    <Pill cls={s.cls}>{s.label}</Pill>
                  </span>
                  <span className="mt-1.5 block truncate text-[15px] font-bold">{it.subject}</span>
                  <span className="mt-0.5 block truncate text-[13px] text-gray-5">{it.category} · {it.preview}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {detail ? (
        <div className="flex flex-col gap-4">
          <div className={`${card} p-6`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-gray-4">{detail.category} · <span className="font-inter">{detail.ticket}</span></div>
                <h2 className="mt-2 text-xl font-bold leading-[1.3] tracking-[-0.03em]">{detail.subject}</h2>
                <div className="mt-2 text-sm text-gray-5">
                  {detail.user?.name ?? "이름 없음"} · <span className="font-inter">{detail.user?.email ?? "-"}</span>
                </div>
              </div>
              <div className="flex flex-none items-center gap-2">
                <Pill cls={statusPill[detail.status].cls}>{statusPill[detail.status].label}</Pill>
                <Button size="sm" variant={detail.status === "done" ? "secondary" : "primary"} onClick={toggleStatus} loading={busy} loadingLabel="변경 중...">
                  {detail.status === "done" ? "다시 열기" : "답변 완료 처리"}
                </Button>
              </div>
            </div>
          </div>
          <InquiryThread inquiry={detail} viewer="admin" placeholder="답변을 입력하세요. 보내면 자동으로 '답변 완료' 상태가 돼요" />
        </div>
      ) : (
        <div className={`${card} px-6 py-24 text-center text-[15px] text-gray-4`}>왼쪽 목록에서 문의를 선택하세요.</div>
      )}
    </div>
  );
}
