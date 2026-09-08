import { createClient } from "@/lib/supabase/server";
import { formatDate, formatLogTime, type DashboardStats, type Product, type ScanLog, type Sticker } from "./types";

export async function listProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, category, created_at, manufacturers(name), stickers(count)")
    .order("created_at", { ascending: false });
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    maker: (p.manufacturers as { name: string } | null)?.name ?? "-",
    category: p.category,
    stickers: (p.stickers as unknown as { count: number }[])[0]?.count ?? 0,
    createdAt: formatDate(p.created_at),
  }));
}

export type Period = "today" | "7d" | "30d";

export async function listScanLogs(period: Period = "today", limit = 200): Promise<ScanLog[]> {
  const supabase = await createClient();
  const since = new Date();
  if (period === "today") since.setHours(0, 0, 0, 0);
  else since.setDate(since.getDate() - (period === "7d" ? 7 : 30));
  const { data } = await supabase
    .from("scan_records")
    .select("id, scanned_at, outcome, count_at_scan, region, score, beads, matched, charge_ms, frame_count, frame_interval_ms, stickers(serial, products(name))")
    .gte("scanned_at", since.toISOString())
    .order("scanned_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((r) => {
    const s = r.stickers as { serial: string; products: { name: string } | null } | null;
    return {
      id: r.id,
      time: formatLogTime(r.scanned_at),
      product: s?.products?.name ?? "등록되지 않은 스티커",
      stickerId: s?.serial ?? "-",
      outcome: r.outcome,
      count: r.count_at_scan,
      region: r.region ?? "-",
      score: r.score === null ? null : Number(r.score),
      beads: r.beads,
      matched: r.matched,
      chargeMs: r.charge_ms,
      frameCount: r.frame_count,
      frameIntervalMs: r.frame_interval_ms,
    };
  });
}

function beadCount(sig: unknown): number | null {
  if (sig && typeof sig === "object" && Array.isArray((sig as { beads?: unknown }).beads)) return (sig as { beads: unknown[] }).beads.length;
  return null;
}

export async function listRecentStickers(limit = 30): Promise<Sticker[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stickers")
    .select("serial, issued_at, status, pattern_signature, products(name)")
    .order("issued_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((s) => ({
    id: s.serial,
    product: (s.products as { name: string } | null)?.name ?? "-",
    issuedAt: formatDate(s.issued_at),
    status: s.status,
    beads: beadCount(s.pattern_signature),
  }));
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const { data } = await supabase.from("dashboard_stats").select("*").maybeSingle();
  const s = data ?? { scans_today: 0, scans_yesterday: 0, genuine_rate_7d: 0, suspected_24h: 0, stickers_issued: 0, stickers_issued_month: 0 };
  const delta = s.scans_today - s.scans_yesterday;
  return {
    scansToday: s.scans_today,
    scansDelta: `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta).toLocaleString()}건 어제 대비`,
    genuineRate: Number(s.genuine_rate_7d),
    genuineNote: "최근 7일 기준",
    suspected: s.suspected_24h,
    suspectedDelta: "최근 24시간",
    stickersIssued: s.stickers_issued,
    stickersNote: `이번 달 +${s.stickers_issued_month.toLocaleString()}`,
  };
}
