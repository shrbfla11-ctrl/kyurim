import type { ReactNode } from "react";
import Link from "next/link";
import { OutcomeBadge, TableHead, TableRow, card } from "@/components/admin/ui";
import type { DashboardStats, ScanLog } from "@/lib/admin/types";

const cols = "160px 1fr 120px 100px 120px";

function Stat({ label, value, note, tone = "gray" }: { label: string; value: ReactNode; note: string; tone?: "gray" | "green" | "red" }) {
  const noteCls = tone === "green" ? "text-green" : tone === "red" ? "text-red" : "text-gray-4";
  return (
    <div className={`${card} p-6`}>
      <div className="text-sm font-semibold text-gray-5">{label}</div>
      <div className={`mt-3 font-inter text-[32px] font-bold tracking-[-0.03em] ${tone === "red" ? "text-red" : ""}`}>{value}</div>
      <div className={`mt-2 text-[13px] font-semibold ${noteCls}`}>{note}</div>
    </div>
  );
}

/** 대시보드 본문: 통계 카드 4개 + 최근 스캔 표 */
export function DashboardContent({ stats: s, recent }: { stats: DashboardStats; recent: ScanLog[] }) {
  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <Stat label="오늘 스캔" value={s.scansToday.toLocaleString()} note={s.scansDelta} tone="green" />
        <Stat label="정품 비율" value={<>{s.genuineRate}<span className="text-xl text-gray-4">%</span></>} note={s.genuineNote} />
        <Stat label="위조 의심" value={s.suspected} note={s.suspectedDelta} tone="red" />
        <Stat label="발급 스티커" value={s.stickersIssued.toLocaleString()} note={s.stickersNote} />
      </div>

      <div className={`${card} mt-6 overflow-hidden`}>
        <div className="flex items-center justify-between px-6 pb-4 pt-6">
          <div className="text-lg font-bold">최근 스캔</div>
          <Link href="/admin/monitor" className="text-sm font-semibold text-gray-5 hover:text-ink">전체 보기</Link>
        </div>
        <TableHead cols={cols}>
          <span>시간</span><span>제품</span><span>결과</span><span className="text-right">스캔 횟수</span><span className="text-right">지역</span>
        </TableHead>
        {recent.map((r) => (
          <TableRow key={r.id} cols={cols}>
            <span className="font-inter text-sm text-gray-5">{r.time.slice(6)}</span>
            <span className="font-semibold">{r.product}</span>
            <span><OutcomeBadge outcome={r.outcome} /></span>
            <span className={`text-right font-inter ${r.count >= 10 ? "text-red" : ""}`}>{r.count}</span>
            <span className="text-right text-gray-5">{r.region}</span>
          </TableRow>
        ))}
        {recent.length === 0 && <div className="px-6 py-12 text-center text-[15px] text-gray-4">아직 스캔 기록이 없어요.</div>}
      </div>
    </>
  );
}
