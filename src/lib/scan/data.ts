import { createClient } from "@/lib/supabase/server";
import { formatShortTime, tagsFor, type HistoryItem, type ScanResult } from "./types";

/** 결과 화면 데이터. 본인 기록이 아니거나 없으면 null. */
export async function getScanResult(id: string): Promise<ScanResult | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("scan_result", { p_id: id });
  if (error || !data) return null;
  const product = data.product;
  return {
    id: data.id,
    outcome: data.outcome,
    scannedAt: data.scannedAt,
    firstScanAt: data.firstScanAt,
    count: data.count,
    product: {
      category: product?.category ?? "미등록 제품",
      name: product?.name ?? "등록되지 않은 스티커",
      maker: product?.maker ?? "-",
      lot: data.lot ?? "-",
      info: product?.info ?? [],
    },
    tags: tagsFor(data.outcome, data.count),
  };
}

/** 내 스캔 기록 */
export async function listHistory(): Promise<HistoryItem[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("scan_history");
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.product_name ?? "등록되지 않은 스티커",
    maker: r.maker_name ?? "-",
    time: formatShortTime(r.scanned_at),
    outcome: r.outcome,
  }));
}
