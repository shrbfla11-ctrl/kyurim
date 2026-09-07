"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import type { HistoryItem, ScanOutcome } from "@/lib/scan/mock";

type Filter = "all" | ScanOutcome;

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "genuine", label: "정품" },
  { key: "unverified", label: "확인 불가" },
  { key: "fake", label: "위조 의심" },
];

const badge: Record<ScanOutcome, { label: string; cls: string }> = {
  genuine: { label: "정품", cls: "bg-green-light text-green" },
  unverified: { label: "확인 불가", cls: "bg-amber-bg text-amber-dark" },
  fake: { label: "위조 의심", cls: "bg-red-light text-red" },
};

/** 스캔 기록 목록. 검색·필터 칩·빈 상태를 포함합니다. */
export function HistoryList({ items }: { items: HistoryItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return items.filter((it) => (filter === "all" || it.outcome === filter) && (!kw || `${it.name} ${it.maker}`.toLowerCase().includes(kw)));
  }, [items, filter, q]);

  return (
    <div className="flex flex-col gap-4">
      <SearchInput placeholder="제품명, 제조사 검색" onSearch={setQ} />

      <div className="flex gap-2 overflow-x-auto">
        {filters.map((f) => {
          const on = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`h-9 flex-none rounded-full px-3.5 text-sm font-semibold transition-colors duration-300 hover:brightness-100 ${on ? "bg-ink text-white" : "bg-gray-1 text-gray-6 hover:bg-gray-2"}`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {list.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {list.map((it) => {
            const b = badge[it.outcome];
            const fake = it.outcome === "fake";
            return (
              <li key={it.id}>
                <Link
                  href={`/scan/result?outcome=${it.outcome}`}
                  className="flex items-center gap-3.5 rounded-[20px] bg-white p-4 text-ink shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                >
                  <span className={`flex h-14 w-14 flex-none items-center justify-center rounded-[14px] bg-gradient-to-br ${fake ? "from-[#FEECEE] to-[#FBD9DC]" : "from-[#EEF5FF] to-[#DCEBFF]"}`}>
                    <span className="block h-[34px] w-[22px] rounded-t-[5px] rounded-b-lg bg-gradient-to-b from-white to-gray-2 shadow-[0_3px_8px_rgba(25,31,40,0.12)]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-bold">{it.name}</span>
                    <span className="mt-1 block text-[13px] text-gray-4">
                      {it.maker} · <span className="font-inter">{it.time}</span>
                    </span>
                  </span>
                  <span className={`flex-none rounded-full px-2.5 py-1.5 text-xs font-bold ${b.cls}`}>{b.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-6 px-6 py-16 text-center">
          <div className="relative h-[120px] w-[120px]">
            <div className="absolute inset-0 rounded-full bg-blue-light" />
            <div className="absolute left-[30px] top-[30px] h-[60px] w-[60px]">
              <span className="absolute left-0 top-0 h-4 w-4 rounded-tl-[5px] border-l-[3px] border-t-[3px] border-blue" />
              <span className="absolute right-0 top-0 h-4 w-4 rounded-tr-[5px] border-r-[3px] border-t-[3px] border-blue" />
              <span className="absolute bottom-0 left-0 h-4 w-4 rounded-bl-[5px] border-b-[3px] border-l-[3px] border-blue" />
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-br-[5px] border-b-[3px] border-r-[3px] border-blue" />
              <span className="absolute left-3.5 top-3.5 h-8 w-8 -rotate-6 rounded-lg bg-white shadow-[0_4px_12px_rgba(49,130,246,0.25)]" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold tracking-[-0.02em]">{items.length === 0 ? "아직 스캔 기록이 없어요" : "조건에 맞는 기록이 없어요"}</div>
            <p className="mt-2 text-[15px] leading-normal text-gray-5">
              {items.length === 0 ? "첫 제품을 스캔하면 결과가 여기에 저장돼요." : "검색어나 필터를 바꿔 보세요."}
            </p>
          </div>
          {items.length === 0 && <Button href="/scan">첫 스캔 시작하기</Button>}
        </div>
      )}
    </div>
  );
}
