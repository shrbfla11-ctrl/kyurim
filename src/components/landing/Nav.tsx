"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MenuIcon } from "@/components/icons";

const links = [
  { href: "#search", label: "알약 검색" },
  { href: "#log", label: "복약 기록" },
  { href: "#how", label: "이용 가이드" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="mx-auto w-full max-w-[1440px] px-6 lg:px-20">
      <div className="flex h-14 items-center justify-between lg:h-[72px]">
        <Link href="/" aria-label="PUF 홈">
          <Image
            src="/puf-logo.png"
            alt="PUF"
            width={951}
            height={598}
            priority
            className="h-7 w-auto lg:h-8"
          />
        </Link>

        <nav className="hidden gap-10 text-base font-semibold lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-ink hover:text-blue">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#cta"
            className="flex h-10 items-center rounded-xl bg-blue px-4 text-sm font-bold text-white hover:bg-blue-dark lg:h-11 lg:px-5 lg:text-[15px]"
          >
            시작하기
          </a>
          <button
            type="button"
            aria-label="메뉴"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center text-ink lg:hidden"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col border-t border-gray-1 py-2 lg:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-3 text-base font-semibold text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
