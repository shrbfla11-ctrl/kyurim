import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BackIcon, CheckIcon } from "@/components/icons";

type Panel = {
  title: ReactNode;
  description?: string;
  bullets?: string[];
  badges?: string[];
};

// 인증 페이지 공용 레이아웃.
// 데스크톱: 좌측 560px 블루 패널 + 우측 폼. 모바일: 상단 뒤로가기 바 + 폼.
export function AuthShell({ panel, children }: { panel: Panel; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[560px_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-blue to-blue-dark p-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -bottom-[120px] -right-[120px] h-[420px] w-[420px] rounded-full bg-white/[0.08]" />
        <Link href="/" className="inline-flex self-start rounded-[14px] bg-white px-3.5 py-2.5">
          <Image src="/puf-logo.png" alt="PUF" width={951} height={598} className="h-7 w-auto" />
        </Link>

        <div className="relative">
          <h2 className="text-4xl font-bold leading-[1.3] tracking-[-0.03em]">{panel.title}</h2>
          {panel.description && (
            <p className="mt-4 max-w-[400px] text-[17px] leading-normal text-white/85">{panel.description}</p>
          )}
          {panel.bullets && (
            <ul className="mt-8 flex flex-col gap-4">
              {panel.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white/[0.18]">
                    <CheckIcon size={14} />
                  </span>
                  <span className="text-base leading-normal text-white/90">{b}</span>
                </li>
              ))}
            </ul>
          )}
          {panel.badges && (
            <div className="mt-10 flex gap-6 text-sm text-white/90">
              {panel.badges.map((b) => (
                <span key={b} className="flex items-center gap-2">
                  <CheckIcon size={16} />
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>

        <p className="relative text-[13px] text-white/60">© 2026 PUF</p>
      </aside>

      <div className="flex min-h-screen flex-col lg:min-h-0 lg:items-center lg:justify-center lg:p-16">
        <div className="flex h-14 items-center justify-between px-4 lg:hidden">
          <Link href="/" aria-label="뒤로" className="flex h-10 w-10 items-center justify-center text-ink">
            <BackIcon />
          </Link>
          <Image src="/puf-logo.png" alt="PUF" width={951} height={598} className="h-6 w-auto" />
          <span className="w-10" />
        </div>
        <div className="flex flex-1 flex-col px-6 pb-10 pt-6 lg:w-full lg:max-w-[400px] lg:flex-none lg:p-0">
          {children}
        </div>
      </div>
    </div>
  );
}
