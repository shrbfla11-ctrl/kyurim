// 스캔 결과 화면에서 쓰는 타입과 표시 메타. 데이터는 src/lib/scan/data.ts 에서 DB 로 조회합니다.
import type { ProductInfo, ScanOutcome } from "@/lib/supabase/types";

export type { ScanOutcome };

export type ScanTag = { label: string; tone: "green" | "blue" | "gray" | "amber" | "red" };

export type ScanResult = {
  id: string;
  outcome: ScanOutcome;
  scannedAt: string;
  firstScanAt: string;
  count: number;
  product: { category: string; name: string; maker: string; lot: string; info: ProductInfo[] };
  tags: ScanTag[];
};

export type HistoryItem = { id: string; name: string; maker: string; time: string; outcome: ScanOutcome };

export function isScanOutcome(v: unknown): v is ScanOutcome {
  return v === "genuine" || v === "unverified" || v === "fake";
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 기록 목록용 짧은 시각: 오늘/어제는 시각만, 그 외는 MM.DD HH:mm */
export function formatShortTime(iso: string, now = new Date()) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  const hm = `${p(d.getHours())}:${p(d.getMinutes())}`;
  const dayDiff = Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86400000);
  if (dayDiff === 0) return `오늘 ${hm}`;
  if (dayDiff === 1) return `어제 ${hm}`;
  return `${p(d.getMonth() + 1)}.${p(d.getDate())} ${hm}`;
}

export const outcomeMeta: Record<ScanOutcome, { badge: string; headline: string; desc: string }> = {
  genuine: { badge: "정품 확인", headline: "정품이에요", desc: "등록된 원본 패턴과 일치해요. 안심하고 사용하세요." },
  unverified: { badge: "확인 불가", headline: "판별할 수 없어요", desc: "패턴을 충분히 읽지 못했어요. 주변 빛을 줄이고 다시 스캔해 주세요." },
  fake: { badge: "위조 의심", headline: "위조가 의심돼요", desc: "등록된 원본 패턴과 일치하지 않아요. 구매처에 문의해 주세요." },
};

/** 결과에 따라 제품 카드에 표시할 태그 */
export function tagsFor(outcome: ScanOutcome, count: number): ScanTag[] {
  if (outcome === "fake") return [{ label: "패턴 불일치", tone: "red" }, ...(count >= 10 ? [{ label: `스캔 ${count}회`, tone: "amber" } as ScanTag] : [])];
  if (outcome === "unverified") return [{ label: "재스캔 필요", tone: "amber" }];
  return [{ label: "정품 인증", tone: "green" }, count <= 1 ? { label: "첫 스캔", tone: "blue" } : { label: `스캔 ${count}회`, tone: count >= 10 ? "amber" : "gray" }];
}
