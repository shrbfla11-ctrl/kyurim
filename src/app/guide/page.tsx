import type { Metadata } from "next";
import { Nav } from "@/components/landing/Nav";
import { TabBar } from "@/components/app/TabBar";
import { GuideView } from "@/components/support/GuideView";
import { getUserSummary } from "@/lib/auth/user";

export const metadata: Metadata = { title: "이용 가이드 - PUF" };

export default async function GuidePage() {
  const user = await getUserSummary();
  return (
    <div className="min-h-dvh bg-gray-1">
      <div className="hidden lg:block">
        <Nav user={user} active="guide" />
      </div>
      <main className="px-5 pb-28 pt-6 lg:mx-auto lg:max-w-[1440px] lg:px-20 lg:pb-24 lg:pt-12">
        <div className="lg:max-w-[1200px]">
          <GuideView />
        </div>
      </main>
      <TabBar active="home" />
    </div>
  );
}
