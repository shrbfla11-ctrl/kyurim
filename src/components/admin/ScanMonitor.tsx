"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { OutcomeBadge, TableHead, TableRow, adminSelect, card } from "@/components/admin/ui";
import type { ScanLog } from "@/lib/admin/types";
import type { Period } from "@/lib/admin/data";
import type { ScanOutcome } from "@/lib/scan/types";

type Filter = "all" | ScanOutcome;
const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "genuine", label: "정품" },
  { key: "unverified", label: "확인 불가" },
  { key: "fake", label: "위조 의심" },
];
const cols = "150px 1fr 110px 90px 90px 150px 90px 130px";

/** 스캔 로그 표: 결과 필터 칩, 기간 선택, CSV 내보내기 */
export function ScanMonitor({ logs, period }: { logs: ScanLog[]; period: Period }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => logs.filter((r) => filter === "all" || r.outcome === filter), [logs, filter]);
  const count = (k: Filter) => (k === "all" ? logs.length : logs.filter((r) => r.outcome === k).length);

  function exportCsv() {
    const label: Record<ScanOutcome, string> = { genuine: "정품", unverified: "확인 불가", fake: "위조 의심" };
    const head = ["시간", "제품", "스티커 ID", "결과", "점수", "비즈(일치/검출)", "조사(ms)", "프레임", "간격(ms)", "스캔 횟수", "지역"];
    const body = rows.map((r) => [r.time, r.product, r.stickerId, label[r.outcome], r.score ?? "", r.beads === null ? "" : `${r.matched ?? 0}/${r.beads}`, r.chargeMs ?? "", r.frameCount ?? "", r.frameIntervalMs ?? "", r.count, r.region]);
    const csv = [head, ...body].map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `puf-scan-logs-${period}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className={`${card} overflow-hidden`}>
      <div className="flex items-center justify-between gap-4 border-b border-gray-1 px-6 py-4">
        <div className="flex gap-2">
          {filters.map((f) => {
            const on = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`h-9 rounded-full px-3.5 text-sm font-semibold transition-colors duration-300 hover:brightness-100 ${on ? "bg-ink text-white" : "bg-gray-1 text-gray-6 hover:bg-gray-2"}`}
              >
                {f.label}<span className="ml-1.5 font-inter opacity-70">{count(f.key)}</span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <select value={period} onChange={(e) => router.push(`/admin/monitor?period=${e.target.value}`)} className={`${adminSelect} h-10`}>
            <option value="today">오늘</option>
            <option value="7d">최근 7일</option>
            <option value="30d">최근 30일</option>
          </select>
          <button type="button" onClick={exportCsv} className="flex h-10 items-center gap-1.5 rounded-xl bg-gray-1 px-3.5 text-sm font-semibold text-gray-6 transition-colors duration-300 hover:bg-gray-2 hover:brightness-100">
            <Download size={16} />
            CSV
          </button>
        </div>
      </div>

      <TableHead cols={cols}>
        <span>시간</span><span>제품</span><span>결과</span><span className="text-right">점수</span><span className="text-right">비즈</span><span className="text-right">촬영 조건</span><span className="text-right">스캔 횟수</span><span className="text-right">지역</span>
      </TableHead>
      {rows.map((r) => (
        <TableRow key={r.id} cols={cols}>
          <span className="font-inter text-sm text-gray-5">{r.time}</span>
          <span>
            <span className="block font-semibold">{r.product}</span>
            <span className="block font-inter text-[13px] text-gray-4">{r.stickerId}</span>
          </span>
          <span><OutcomeBadge outcome={r.outcome} /></span>
          <span className="text-right font-inter text-sm">{r.score === null ? "-" : r.score.toFixed(2)}</span>
          <span className="text-right font-inter text-sm" title="일치 / 검출">{r.beads === null ? "-" : `${r.matched ?? 0}/${r.beads}`}</span>
          <span className="text-right font-inter text-[13px] text-gray-5">{r.chargeMs === null ? "-" : `${(r.chargeMs / 1000).toFixed(1)}s · ${r.frameCount}장 · ${r.frameIntervalMs}ms`}</span>
          <span className={`text-right font-inter font-semibold ${r.count >= 10 ? "text-red" : ""}`}>{r.count}</span>
          <span className="text-right text-gray-5">{r.region}</span>
        </TableRow>
      ))}
      {rows.length === 0 && <div className="px-6 py-16 text-center text-[15px] text-gray-4">해당 조건의 스캔 로그가 없어요.</div>}
    </div>
  );
}
