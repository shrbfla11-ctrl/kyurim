import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Nav } from "@/components/landing/Nav";
import { TabBar } from "@/components/app/TabBar";
import { InquiryDetail, InquiryList } from "@/components/support/InquiryList";
import { getUserSummary } from "@/lib/auth/user";
import { mockInquiries } from "@/lib/support/mock";

export const metadata: Metadata = { title: "문의 내역 - PUF" };

const side = [
  { href: "/profile", label: "내 프로필" },
  { href: "/support/inquiries", label: "문의 내역", active: true },
  { href: "/support", label: "고객센터" },
];

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getUserSummary();
  if (!user) redirect("/login?next=/support/inquiries");
  const { id } = await searchParams;
  // DB 연결 전까지 예시 문의를 보여 줍니다.
  const items = mockInquiries;
  const selected = items.find((i) => i.id === id) ?? null;
  const detail = selected ?? items[0] ?? null;

  return (
    <div className="min-h-dvh bg-gray-1">
      <div className="hidden lg:block">
        <Nav user={user} active="support" />
      </div>

      {/* 모바일: id 가 있으면 상세, 없으면 목록 */}
      <header className="flex h-14 items-center justify-between px-2 lg:hidden">
        <Link href={selected ? "/support/inquiries" : "/support"} aria-label="뒤로" className="flex h-11 w-11 items-center justify-center text-ink"><ChevronLeft size={24} /></Link>
        <span className="text-base font-semibold">{selected ? "문의 상세" : ""}</span>
        <span className="w-11" />
      </header>
      <div className="px-5 pb-28 pt-2 lg:hidden">
        {selected ? <InquiryDetail key={selected.id} inquiry={selected} /> : <InquiryList items={items} />}
      </div>

      {/* 데스크톱: 사이드 메뉴 + 목록 + 상세 */}
      <main className="hidden lg:mx-auto lg:grid lg:max-w-[1440px] lg:grid-cols-[200px_400px_1fr] lg:items-start lg:gap-10 lg:px-20 lg:pb-24 lg:pt-12">
        <aside className="sticky top-6 flex flex-col gap-1">
          {side.map((s) => (
            <Link key={s.href} href={s.href} className={`rounded-xl px-4 py-3 text-[15px] transition-colors duration-300 ${s.active ? "bg-blue-light font-bold text-blue" : "font-semibold text-gray-6 hover:bg-gray-2"}`}>{s.label}</Link>
          ))}
        </aside>
        <InquiryList items={items} selectedId={detail?.id} />
        {detail && <InquiryDetail key={detail.id} inquiry={detail} />}
      </main>

      {!selected && <TabBar active="me" />}
    </div>
  );
}
