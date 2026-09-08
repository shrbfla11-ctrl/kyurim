// 관리자 화면 타입. 데이터는 src/lib/admin/data.ts 에서 DB 로 조회합니다.
import type { ProductCategory, ScanOutcome, StickerStatus } from "@/lib/supabase/types";

export const categories = ["스킨케어", "전자기기", "건강식품", "패션잡화"] as const satisfies readonly ProductCategory[];
export type Category = ProductCategory;
export type { StickerStatus };

export type Product = { id: string; name: string; maker: string; category: Category; stickers: number; createdAt: string };
export type ScanLog = {
  id: string; time: string; product: string; stickerId: string; outcome: ScanOutcome; count: number; region: string;
  score: number | null; beads: number | null; matched: number | null; chargeMs: number | null; frameCount: number | null; frameIntervalMs: number | null;
};
export type Sticker = { id: string; product: string; issuedAt: string; status: StickerStatus; beads: number | null };
export type DashboardStats = {
  scansToday: number; scansDelta: string; genuineRate: number; genuineNote: string;
  suspected: number; suspectedDelta: string; stickersIssued: number; stickersNote: string;
};

export function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
export function formatLogTime(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
