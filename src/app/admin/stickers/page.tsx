import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { StickerIssuance } from "@/components/admin/StickerIssuance";
import { getUserSummary } from "@/lib/auth/user";
import { products, stickers } from "@/lib/admin/mock";

export const metadata: Metadata = { title: "스티커 발급 - PUF" };

export default async function AdminStickersPage() {
  const user = (await getUserSummary())!;
  return (
    <AdminShell user={user} active="stickers" title="스티커 발급" subtitle="제품을 선택하고 패턴 이미지를 업로드하면 스티커가 등록돼요.">
      <StickerIssuance products={products} initial={stickers} />
    </AdminShell>
  );
}
