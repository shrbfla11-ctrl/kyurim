import { redirect } from "next/navigation";
import { Nav } from "@/components/landing/Nav";
import { getUserSummary } from "@/lib/auth/user";

export const metadata = { title: "관리자 - PUF" };

export default async function AdminPage() {
  const user = await getUserSummary();
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) redirect("/");

  return (
    <>
      <Nav user={user} />
      <main className="mx-auto w-full max-w-[1440px] px-6 py-16 lg:px-20">
        <h1 className="text-[28px] font-bold tracking-[-0.03em] text-ink">관리자 페이지</h1>
        <p className="mt-2 text-[15px] text-gray-5">제품 등록·스티커 발급·스캔 현황 관리 기능은 데이터 구조 확정 후 추가됩니다.</p>
      </main>
    </>
  );
}
