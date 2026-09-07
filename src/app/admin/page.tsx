import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { DashboardContent } from "@/components/admin/DashboardContent";
import { getUserSummary } from "@/lib/auth/user";

export const metadata: Metadata = { title: "관리자 대시보드 - PUF" };

export default async function AdminDashboardPage() {
  const user = (await getUserSummary())!;
  return (
    <AdminShell user={user} active="dashboard" title="대시보드" subtitle="오늘의 정품 확인 현황을 한눈에 볼 수 있어요.">
      <DashboardContent />
    </AdminShell>
  );
}
