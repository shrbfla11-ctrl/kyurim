"use client";

import { useState } from "react";
import Link from "next/link";
import { BookmarkCheck, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * 결과 화면 액션. 모바일은 하단 고정 바, 데스크톱은 우측 카드로 렌더링됩니다.
 * 스캔 결과는 저장 시점에 자동으로 기록되므로 "기록 보기" 링크만 제공합니다.
 */
export function ResultActions({ canSave, layout }: { canSave: boolean; layout: "mobile" | "desktop" }) {
  const [shared, setShared] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "PUF 정품 확인 결과", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    } catch {
      /* 사용자가 취소한 경우 */
    }
  }

  if (layout === "mobile") {
    return (
      <div className="sticky bottom-0 flex gap-2 bg-gray-1/90 px-4 pb-6 pt-3 backdrop-blur-md lg:hidden">
        <Button href="/scan" className="flex-1">다시 스캔</Button>
        {canSave && (
          <Link href="/history" aria-label="기록 보기" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-light text-blue">
            <BookmarkCheck size={22} />
          </Link>
        )}
        <button type="button" aria-label="공유" onClick={share} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-light text-blue">
          <Share2 size={22} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-[20px] bg-white p-6 shadow-card">
      <Button href="/scan">다시 스캔</Button>
      {canSave && (
        <Button href="/history" variant="secondary" size="md" icon={<BookmarkCheck size={18} />}>
          기록에 저장됨
        </Button>
      )}
      <Button variant="ghost" size="md" onClick={share} icon={<Share2 size={18} />} className="bg-gray-1 text-gray-6">
        {shared ? "링크를 복사했어요" : "공유하기"}
      </Button>
    </div>
  );
}
