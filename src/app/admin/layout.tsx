import { redirect } from "next/navigation";
import { getUserSummary } from "@/lib/auth/user";

// 관리자 영역 접근 제어. 각 페이지는 getUserSummary 를 다시 호출해 셸에 사용자 정보를 넘깁니다.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUserSummary();
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) redirect("/");
  return children;
}
