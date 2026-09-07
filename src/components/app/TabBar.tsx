import Link from "next/link";
import { Clock, Home, ScanLine, UserRound } from "lucide-react";

export type TabKey = "home" | "scan" | "history" | "me";

const tabs: { key: TabKey; href: string; label: string; Icon: typeof Home }[] = [
  { key: "home", href: "/", label: "홈", Icon: Home },
  { key: "scan", href: "/scan", label: "스캔", Icon: ScanLine },
  { key: "history", href: "/history", label: "기록", Icon: Clock },
  { key: "me", href: "/profile", label: "MY", Icon: UserRound },
];

/** 모바일 하단 탭바. 데스크톱(lg 이상)에서는 숨겨집니다. */
export function TabBar({ active, dark = false }: { active: TabKey; dark?: boolean }) {
  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-20 grid h-[84px] grid-cols-4 items-end border-t px-4 pb-5 pt-2 lg:hidden ${
        dark ? "border-white/10 bg-ink" : "border-gray-1 bg-white"
      }`}
    >
      {tabs.map(({ key, href, label, Icon }) => {
        const on = active === key;
        const color = on ? "text-blue" : "text-gray-4";
        if (key === "scan") {
          return (
            <Link key={key} href={href} className={`flex h-14 flex-col items-center justify-end gap-1 text-[11px] font-bold ${color}`}>
              <span className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-blue text-white shadow-[0_8px_20px_rgba(49,130,246,0.4)] transition duration-300 hover:bg-blue-dark">
                <Icon size={26} strokeWidth={2} />
              </span>
              {label}
            </Link>
          );
        }
        return (
          <Link key={key} href={href} className={`flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${color}`}>
            <Icon size={24} strokeWidth={2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
