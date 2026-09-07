import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { ScanMonitor } from "@/components/admin/ScanMonitor";
import { getUserSummary } from "@/lib/auth/user";
import { listScanLogs, type Period } from "@/lib/admin/data";

export const metadata: Metadata = { title: "스캔 모니터링 - PUF" };

export default async function AdminMonitorPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { period: raw } = await searchParams;
  const period: Period = raw === "7d" || raw === "30d" ? raw : "today";
  const [user, scanLogs] = await Promise.all([getUserSummary(), listScanLogs(period)]);
  return (
    <AdminShell user={user!} active="monitor" title="스캔 모니터링" subtitle="실시간 스캔 로그를 결과별로 확인할 수 있어요.">
      <ScanMonitor logs={scanLogs} period={period} />
    </AdminShell>
  );
}
