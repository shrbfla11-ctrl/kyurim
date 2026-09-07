import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { getUserSummary } from "@/lib/auth/user";
import { products } from "@/lib/admin/mock";

export const metadata: Metadata = { title: "제품 관리 - PUF" };

export default async function AdminProductsPage() {
  const user = (await getUserSummary())!;
  return (
    <AdminShell user={user} active="products" title="제품 관리" subtitle="등록된 제품과 발급된 스티커 수를 관리해요.">
      <ProductsTable initial={products} />
    </AdminShell>
  );
}
