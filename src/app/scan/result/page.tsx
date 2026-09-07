import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { Nav } from "@/components/landing/Nav";
import { ResultView } from "@/components/scan/ResultView";
import { ResultActions } from "@/components/scan/ResultActions";
import { getUserSummary } from "@/lib/auth/user";
import { getScanResult } from "@/lib/scan/data";

export const metadata: Metadata = { title: "스캔 결과 - PUF" };

type Search = Promise<Record<string, string | string[] | undefined>>;

export default async function ScanResultPage({ searchParams }: { searchParams: Search }) {
  const { id } = await searchParams;
  const user = await getUserSummary();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/scan/result?id=${id ?? ""}`)}`);
  const result = typeof id === "string" ? await getScanResult(id) : null;
  if (!result) redirect("/history");
  const canSave = true;

  return (
    <div className="min-h-dvh bg-gray-1">
      <div className="hidden lg:block">
        <Nav user={user} active="verify" />
      </div>

      {/* 모바일 헤더 */}
      <header className="flex h-14 items-center justify-between px-2 lg:hidden">
        <Link href="/scan" aria-label="뒤로" className="flex h-11 w-11 items-center justify-center text-ink">
          <ChevronLeft size={24} />
        </Link>
        <span className="text-base font-semibold">스캔 결과</span>
        <span className="w-11" />
      </header>

      <main className="px-4 pb-2 pt-2 lg:mx-auto lg:grid lg:max-w-[1440px] lg:grid-cols-[1fr_360px] lg:items-start lg:gap-12 lg:px-20 lg:pb-20 lg:pt-12">
        <ResultView result={result} />

        <aside className="hidden lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-4">
          <ResultActions canSave={canSave} layout="desktop" />
          <div className="flex items-start gap-3 rounded-[20px] bg-white p-6 shadow-card">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-green-light text-green">
              <ShieldCheck size={20} />
            </span>
            <div>
              <div className="text-[15px] font-bold">이미지는 저장되지 않았어요</div>
              <div className="mt-1 text-sm leading-normal text-gray-5">촬영 이미지는 패턴 대조 직후 삭제되었어요.</div>
            </div>
          </div>
        </aside>
      </main>

      <ResultActions canSave={canSave} layout="mobile" />
    </div>
  );
}
