import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminInquiries } from "@/components/admin/AdminInquiries";
import { getUserSummary } from "@/lib/auth/user";
import { getInquiryForAdmin, listAllInquiries, type InquiryFilter } from "@/lib/support/data";

export const metadata: Metadata = { title: "고객 지원 - PUF" };

export default async function AdminSupportPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { status, id } = await searchParams;
  const filter: InquiryFilter = status === "wait" || status === "done" ? status : "all";
  const [user, all] = await Promise.all([getUserSummary(), listAllInquiries("all")]);
  const items = filter === "all" ? all : all.filter((i) => i.status === filter);
  const counts = { all: all.length, wait: all.filter((i) => i.status === "wait").length, done: all.filter((i) => i.status === "done").length };
  const selectedId = typeof id === "string" && items.some((i) => i.id === id) ? id : items[0]?.id;
  const detail = selectedId ? await getInquiryForAdmin(selectedId) : null;

  return (
    <AdminShell user={user!} active="support" title="고객 지원" subtitle="고객이 남긴 1:1 문의에 답변하고 상태를 관리해요.">
      <AdminInquiries items={items} filter={filter} detail={detail} counts={counts} />
    </AdminShell>
  );
}
