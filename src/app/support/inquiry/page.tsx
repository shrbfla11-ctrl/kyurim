import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Nav } from "@/components/landing/Nav";
import { InquiryForm } from "@/components/support/InquiryForm";
import { getUserSummary } from "@/lib/auth/user";
import { supportCategories, type SupportCategory } from "@/lib/support/mock";

export const metadata: Metadata = { title: "1:1 문의 - PUF" };

const tips = ["사용 중인 기기와 브라우저", "스캔한 제품명과 결과 화면 스크린샷", "문제가 발생한 시간"];

export default async function InquiryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getUserSummary();
  if (!user) redirect("/login?next=/support/inquiry");
  const { category } = await searchParams;
  const defaultCategory = supportCategories.find((c) => c === category) as SupportCategory | undefined;

  return (
    <div className="min-h-dvh bg-gray-1">
      <div className="hidden lg:block">
        <Nav user={user} active="support" />
      </div>
      <header className="flex h-14 items-center justify-between px-2 lg:hidden">
        <Link href="/support" aria-label="뒤로" className="flex h-11 w-11 items-center justify-center text-ink"><ChevronLeft size={24} /></Link>
        <span className="text-base font-semibold">문의하기</span>
        <span className="w-11" />
      </header>
      <main className="px-5 pb-10 pt-2 lg:mx-auto lg:grid lg:max-w-[1440px] lg:grid-cols-[640px_320px] lg:items-start lg:gap-12 lg:px-20 lg:pb-24 lg:pt-12">
        <InquiryForm email={user.email ?? ""} defaultCategory={defaultCategory} />
        <aside className="hidden lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-4">
          <div className="rounded-[20px] bg-white p-6 shadow-card">
            <div className="text-base font-bold">빠른 답변을 위한 팁</div>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm leading-relaxed text-gray-6">
              {tips.map((t) => <li key={t} className="flex gap-2"><span className="font-bold text-blue">·</span>{t}</li>)}
            </ul>
          </div>
          <div className="rounded-[20px] bg-white p-6 shadow-card">
            <div className="text-[13px] text-gray-4">운영 시간</div>
            <div className="mt-1 text-[15px] font-semibold">평일 <span className="font-inter">10:00 – 18:00</span></div>
            <div className="mt-3 text-[13px] text-gray-4">이메일</div>
            <div className="mt-1 font-inter text-[15px] font-semibold">admin@puf.com</div>
          </div>
        </aside>
      </main>
    </div>
  );
}
