import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Activity, House, LayoutGrid, MessageSquareText, Package, ScanLine } from "lucide-react";
import type { UserSummary } from "@/components/auth/UserMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type AdminNavKey = "dashboard" | "products" | "stickers" | "monitor" | "support";

const nav: { key: AdminNavKey; href: string; label: string; Icon: typeof LayoutGrid }[] = [
  { key: "dashboard", href: "/admin", label: "대시보드", Icon: LayoutGrid },
  { key: "products", href: "/admin/products", label: "제품 관리", Icon: Package },
  { key: "stickers", href: "/admin/stickers", label: "스티커 발급", Icon: ScanLine },
  { key: "monitor", href: "/admin/monitor", label: "스캔 모니터링", Icon: Activity },
  { key: "support", href: "/admin/support", label: "고객 지원", Icon: MessageSquareText },
];

/** 관리자 공통 레이아웃: 좌측 사이드바 + 제목 영역. 데스크톱 전용입니다. */
export function AdminShell({
  user,
  active,
  title,
  subtitle,
  action,
  children,
}: {
  user: UserSummary;
  active: AdminNavKey;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const initial = (user.name ?? user.email ?? "?").slice(0, 1).toUpperCase();
  return (
    <div className="grid min-h-dvh grid-cols-[240px_1fr] bg-gray-1 text-ink">
      <aside className="flex flex-col gap-8 border-r border-gray-2 bg-white px-4 py-6">
        <Link href="/admin" className="flex items-center gap-2.5 px-2">
          <Image src="/puf-logo.png" alt="PUF" width={951} height={598} className="h-6 w-auto" />
          <span className="rounded-full bg-blue-light px-2 py-0.5 font-inter text-[11px] font-bold text-blue">ADMIN</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {nav.map(({ key, href, label, Icon }) => {
            const on = active === key;
            return (
              <Link
                key={key}
                href={href}
                className={`flex h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition-colors duration-300 ${on ? "bg-blue-light text-blue" : "text-gray-6 hover:bg-gray-1"}`}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/"
          className="mt-auto flex h-11 items-center gap-3 rounded-xl border border-gray-2 px-3 text-[15px] font-semibold text-gray-6 transition-colors duration-300 hover:bg-gray-1"
        >
          <House size={20} />
          홈으로 돌아가기
        </Link>
        <div className="-mt-4 flex items-center gap-2.5 rounded-[14px] bg-gray-1 p-3">
          <Avatar className="size-9 flex-none">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback className="bg-blue-light text-sm font-bold text-blue">{initial}</AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold">{user.name ?? "관리자"}</span>
            <span className="block truncate text-xs text-gray-4">{user.email}</span>
          </span>
        </div>
      </aside>

      <main className="min-w-0 px-12 pb-16 pt-8">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.03em]">{title}</h1>
            <p className="mt-1.5 text-[15px] text-gray-5">{subtitle}</p>
          </div>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}
