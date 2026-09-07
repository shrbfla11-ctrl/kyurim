import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { ScanMonitor } from "@/components/admin/ScanMonitor";
import { getUserSummary } from "@/lib/auth/user";
import { scanLogs } from "@/lib/admin/mock";

export const metadata: Metadata = { title: "스캔 모니터링 - PUF" };

export default async function AdminMonitorPage() {
  const user = (await getUserSummary())!;
  return (
    <AdminShell user={user} active="monitor" title="스캔 모니터링" subtitle="실시간 스캔 로그를 결과별로 확인할 수 있어요.">
      <ScanMonitor logs={scanLogs} />
    </AdminShell>
  );
}
