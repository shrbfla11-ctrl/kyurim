import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Nav } from "@/components/landing/Nav";
import { TabBar } from "@/components/app/TabBar";
import { ProfileView } from "@/components/profile/ProfileView";
import { getUserSummary } from "@/lib/auth/user";

export const metadata: Metadata = { title: "내 프로필 - PUF" };

const side = [
  { href: "/profile", label: "내 프로필", active: true },
  { href: "/support/inquiries", label: "문의 내역" },
];

export default async function ProfilePage() {
  const user = await getUserSummary();
  if (!user) redirect("/login?next=/profile");

  return (
    <div className="min-h-dvh bg-gray-1">
      <div className="hidden lg:block">
        <Nav user={user} />
      </div>

      <main className="px-4 pb-28 pt-4 lg:mx-auto lg:grid lg:max-w-[1440px] lg:grid-cols-[240px_1fr] lg:gap-12 lg:px-20 lg:pb-20 lg:pt-12">
        <aside className="hidden lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-1 lg:self-start">
          {side.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`rounded-xl px-4 py-3 text-[15px] transition-colors duration-300 ${s.active ? "bg-blue-light font-bold text-blue" : "font-semibold text-gray-6 hover:bg-gray-2"}`}
            >
              {s.label}
            </Link>
          ))}
        </aside>

        <div className="lg:max-w-[760px]">
          <h1 className="px-1 text-[28px] font-bold tracking-[-0.03em] lg:mb-6 lg:px-0 lg:text-[32px]">
            <span className="lg:hidden">MY</span>
            <span className="hidden lg:inline">내 프로필</span>
          </h1>
          <div className="mt-4 lg:mt-0">
            <ProfileView user={user} />
          </div>
        </div>
      </main>

      <TabBar active="me" />
    </div>
  );
}
