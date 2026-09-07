import type { ReactNode } from "react";
import type { ScanOutcome } from "@/lib/scan/types";

export const card = "rounded-[20px] bg-white shadow-card";

const outcomeBadge: Record<ScanOutcome, { label: string; cls: string }> = {
  genuine: { label: "정품", cls: "bg-green-light text-green" },
  unverified: { label: "확인 불가", cls: "bg-amber-bg text-amber-dark" },
  fake: { label: "위조 의심", cls: "bg-red-light text-red" },
};

export function OutcomeBadge({ outcome }: { outcome: ScanOutcome }) {
  const b = outcomeBadge[outcome];
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${b.cls}`}>{b.label}</span>;
}

export function Pill({ children, cls }: { children: ReactNode; cls: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}>{children}</span>;
}

/** 관리자 표 공통 행 스타일. cols 는 grid-template-columns 값입니다. */
export function TableHead({ cols, children }: { cols: string; children: ReactNode }) {
  return (
    <div className="grid border-b border-gray-1 px-6 py-3 text-[13px] font-semibold text-gray-4" style={{ gridTemplateColumns: cols }}>
      {children}
    </div>
  );
}

export function TableRow({ cols, children }: { cols: string; children: ReactNode }) {
  return (
    <div className="grid items-center border-b border-gray-1 px-6 py-3.5 text-[15px] transition-colors duration-300 hover:bg-[#F9FAFB]" style={{ gridTemplateColumns: cols }}>
      {children}
    </div>
  );
}

export const adminInput =
  "h-11 rounded-xl border-[1.5px] border-transparent bg-gray-1 px-3.5 text-sm text-ink outline-none transition-colors duration-300 focus:border-blue focus:bg-white";
export const adminSelect = "h-11 rounded-xl border-0 bg-gray-1 px-3.5 text-sm font-semibold text-gray-6 outline-none";

export function ProductThumb({ fake = false, size = 40 }: { fake?: boolean; size?: number }) {
  return (
    <span
      className={`flex flex-none items-center justify-center rounded-[10px] bg-gradient-to-br ${fake ? "from-[#FEECEE] to-[#FBD9DC]" : "from-[#EEF5FF] to-[#DCEBFF]"}`}
      style={{ width: size, height: size }}
    >
      <span className="block rounded-t-[3px] rounded-b-[5px] bg-gradient-to-b from-white to-gray-2" style={{ width: size * 0.35, height: size * 0.55 }} />
    </span>
  );
}
