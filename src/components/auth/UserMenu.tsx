"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type UserSummary = {
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  /** 연결된 로그인 방식 (email, google, kakao ...) */
  providers: string[];
  marketingOptIn: boolean;
};

// 이름 또는 이메일 앞 글자로 임시 프로필 이니셜을 만듭니다.
function initials(user: UserSummary) {
  const base = user.name?.trim() || user.email?.split("@")[0] || "";
  return base ? base.slice(0, 1).toUpperCase() : "?";
}

const itemClass = "h-11 cursor-pointer gap-3 rounded-xl px-3 text-[15px] font-medium text-ink transition-colors duration-300 hover:bg-gray-1 focus:bg-gray-1 [&_svg]:size-5 [&_svg]:text-gray-4";

export function UserMenu({ user }: { user: UserSummary }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="내 계정"
        className="rounded-full outline-none ring-blue/40 transition duration-300 hover:brightness-[0.96] focus-visible:ring-2"
      >
        <Avatar size="lg">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
          <AvatarFallback className="bg-blue-light font-bold text-blue">{initials(user)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="min-w-64 rounded-2xl p-2 shadow-card ring-gray-2">
        <div className="px-3 pb-3 pt-2">
          <p className="text-[15px] font-bold text-ink">{user.name ?? "PUF 사용자"}</p>
          {user.email && <p className="mt-0.5 text-[13px] text-gray-5">{user.email}</p>}
        </div>
        <DropdownMenuSeparator className="bg-gray-2" />

        <DropdownMenuItem className={itemClass} render={<Link href="/profile" />}>
          <UserRound />
          내 프로필
        </DropdownMenuItem>

        {user.isAdmin && (
          <>
            <DropdownMenuSeparator className="bg-gray-2" />
            <DropdownMenuItem className={itemClass} render={<Link href="/admin" />}>
              <ShieldCheck />
              관리자 페이지
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator className="bg-gray-2" />
        <DropdownMenuItem
          variant="destructive"
          className={`${itemClass} text-red [&_svg]:text-red`}
          onClick={signOut}
          disabled={busy}
        >
          <LogOut />
          {busy ? "로그아웃 중..." : "로그아웃"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
