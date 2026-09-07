import type { Metadata } from "next";
import { Nav } from "@/components/landing/Nav";
import { TabBar } from "@/components/app/TabBar";
import { SupportView } from "@/components/support/SupportView";
import { getUserSummary } from "@/lib/auth/user";
import { listFaqs } from "@/lib/support/data";

export const metadata: Metadata = { title: "고객센터 - PUF" };

export default async function SupportPage() {
  const [user, faqs] = await Promise.all([getUserSummary(), listFaqs()]);
  return (
    <div className="min-h-dvh bg-gray-1">
      <div className="hidden lg:block">
        <Nav user={user} active="support" />
      </div>
      <main className="px-5 pb-28 pt-6 lg:mx-auto lg:max-w-[1440px] lg:px-20 lg:pb-24 lg:pt-12">
        <div className="lg:max-w-[1040px]">
          <SupportView loggedIn={!!user} faqs={faqs} />
        </div>
      </main>
      <TabBar active="me" />
    </div>
  );
}
