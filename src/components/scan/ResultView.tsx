"use client";

import { useState } from "react";
import { Check, ChevronDown, CircleAlert, CircleHelp, TriangleAlert } from "lucide-react";
import { formatDateTime, outcomeMeta, type ScanResult, type ScanTag } from "@/lib/scan/types";

const tone: Record<ScanTag["tone"], string> = {
  green: "bg-green-light text-green",
  blue: "bg-blue-light text-blue",
  gray: "bg-gray-1 text-gray-6",
  amber: "bg-amber-bg text-amber-dark",
  red: "bg-red-light text-red",
};

const hero = {
  genuine: { bg: "bg-green-light", icon: "bg-green", accent: "text-green" },
  unverified: { bg: "bg-amber-bg", icon: "bg-amber", accent: "text-amber-dark" },
  fake: { bg: "bg-red-light", icon: "bg-red", accent: "text-red" },
};

const card = "rounded-[20px] bg-white p-6 shadow-card";

/** 스캔 결과 본문. 상태 히어로 · 제품 카드 · 검증 상세 · 제품 정보 아코디언 */
export function ResultView({ result }: { result: ScanResult }) {
  const [open, setOpen] = useState(0);
  const meta = outcomeMeta[result.outcome];
  const h = hero[result.outcome];
  const isFake = result.outcome === "fake";
  const manyScans = result.count >= 10;

  return (
    <div className="flex flex-col gap-4 text-ink">
      <div className={`flex flex-col items-center gap-4 rounded-3xl px-6 py-8 text-center ${h.bg}`}>
        <div className={`flex h-[72px] w-[72px] items-center justify-center rounded-full text-white ${h.icon}`}>
          {result.outcome === "genuine" && <Check size={36} strokeWidth={2.5} />}
          {result.outcome === "unverified" && <CircleHelp size={36} strokeWidth={2.5} />}
          {isFake && <TriangleAlert size={36} strokeWidth={2.5} />}
        </div>
        <div>
          <span className={`inline-block rounded-full bg-white px-3 py-1.5 text-[13px] font-bold ${h.accent}`}>{meta.badge}</span>
          <h1 className="mt-3 text-[28px] font-bold leading-[1.3] tracking-[-0.03em]">{meta.headline}</h1>
          <p className="mt-2 text-[15px] leading-normal text-gray-6">{meta.desc}</p>
        </div>
      </div>

      <div className={`${card} flex items-start gap-4`}>
        <div className="flex h-[88px] w-[88px] flex-none items-center justify-center rounded-2xl bg-gradient-to-br from-[#EEF5FF] to-[#DCEBFF]">
          <div className="h-14 w-9 rounded-t-lg rounded-b-xl bg-gradient-to-b from-white to-gray-2 shadow-[0_4px_12px_rgba(25,31,40,0.12)]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] text-gray-4">{result.product.category}</div>
          <div className="mt-1 text-lg font-bold tracking-[-0.02em]">{result.product.name}</div>
          <div className="mt-1 text-sm text-gray-5">
            {result.product.maker} · LOT <span className="font-inter">{result.product.lot}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {result.tags.map((t) => (
              <span key={t.label} className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${tone[t.tone]}`}>{t.label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className={card}>
        <div className="text-base font-bold">검증 상세</div>
        <dl className="mt-2 flex flex-col text-[15px]">
          <Row label="상태"><span className={`font-semibold ${h.accent}`}>{meta.badge}</span></Row>
          <Row label="이 스티커 누적 스캔"><span className={`font-inter font-semibold ${manyScans ? "text-red" : ""}`}>{result.count}회</span></Row>
          <Row label="최초 스캔"><span className="font-inter font-semibold">{formatDateTime(result.firstScanAt)}</span></Row>
          <Row label="이번 스캔" last><span className="font-inter font-semibold">{formatDateTime(result.scannedAt)}</span></Row>
        </dl>
        {manyScans && !isFake && (
          <Notice tone="amber" title="스캔 횟수가 많아요">
            이 스티커는 여러 번 스캔되었어요. 스티커가 재사용되었을 가능성이 있으니 구매처를 확인해 주세요.
          </Notice>
        )}
        {isFake && (
          <Notice tone="red" title="구매처에 문의해 주세요">
            등록된 정품 패턴과 일치하지 않아요. 제조사 고객센터 또는 구매처에 제품 상태를 확인해 보세요.
          </Notice>
        )}
      </div>

      <div className="rounded-[20px] bg-white px-6 py-2 shadow-card">
        {result.product.info.map((f, i) => {
          const isOpen = open === i;
          const last = i === result.product.info.length - 1;
          return (
            <div key={f.title} className={last ? "" : "border-b border-gray-1"}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left hover:brightness-100"
              >
                <span className="text-base font-semibold text-ink">{f.title}</span>
                <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full bg-gray-1 text-gray-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                  <ChevronDown size={16} strokeWidth={2.5} />
                </span>
              </button>
              {isOpen && <div className="pb-4 text-[15px] leading-relaxed text-gray-5">{f.body}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex justify-between py-3 ${last ? "" : "border-b border-gray-1"}`}>
      <dt className="text-gray-5">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Notice({ tone, title, children }: { tone: "amber" | "red"; title: string; children: React.ReactNode }) {
  const amber = tone === "amber";
  return (
    <div className={`mt-2 flex items-start gap-2.5 rounded-2xl p-4 ${amber ? "bg-amber-bg" : "bg-red-light"}`}>
      {amber ? <TriangleAlert size={18} className="mt-0.5 flex-none text-amber-ink" /> : <CircleAlert size={18} className="mt-0.5 flex-none text-red" />}
      <div>
        <div className={`text-sm font-bold ${amber ? "text-amber-ink" : "text-red-dark"}`}>{title}</div>
        <p className={`mt-1 text-sm leading-normal ${amber ? "text-amber-text" : "text-red-text"}`}>{children}</p>
      </div>
    </div>
  );
}
