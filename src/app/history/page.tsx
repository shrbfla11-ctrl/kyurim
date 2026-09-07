import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Nav } from "@/components/landing/Nav";
import { TabBar } from "@/components/app/TabBar";
import { HistoryList } from "@/components/history/HistoryList";
import { getUserSummary } from "@/lib/auth/user";
import { listHistory } from "@/lib/scan/data";

export const metadata: Metadata = { title: "스캔 기록 - PUF" };

export default async function HistoryPage() {
  const user = await getUserSummary();
  if (!user) redirect("/login?next=/history");

  const items = await listHistory();

  return (
    <div className="min-h-dvh bg-white">
      <div className="hidden lg:block">
        <Nav user={user} active="history" />
      </div>

      <main className="px-5 pb-28 pt-4 lg:mx-auto lg:max-w-[1440px] lg:px-20 lg:pb-20 lg:pt-12">
        <div className="lg:max-w-[880px]">
          <h1 className="text-[28px] font-bold tracking-[-0.03em] lg:text-[32px]">스캔 기록</h1>
          <p className="mt-2 hidden text-base text-gray-5 lg:block">저장한 정품 확인 결과를 다시 볼 수 있어요.</p>
          <div className="mt-4 lg:mt-8">
            <HistoryList items={items} />
          </div>
        </div>
      </main>

      <TabBar active="history" />
    </div>
  );
}
