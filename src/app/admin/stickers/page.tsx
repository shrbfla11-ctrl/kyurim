import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { StickerIssuance } from "@/components/admin/StickerIssuance";
import { getUserSummary } from "@/lib/auth/user";
import { listProducts, listRecentStickers } from "@/lib/admin/data";

export const metadata: Metadata = { title: "스티커 발급 - PUF" };

export default async function AdminStickersPage() {
  const [user, products, stickers] = await Promise.all([getUserSummary(), listProducts(), listRecentStickers()]);
  return (
    <AdminShell user={user!} active="stickers" title="스티커 발급" subtitle="시리얼을 발급한 뒤 휴대폰 등록 모드로 실제 스티커의 감쇠 패턴을 저장해요.">
      <StickerIssuance products={products} initial={stickers} />
    </AdminShell>
  );
}
