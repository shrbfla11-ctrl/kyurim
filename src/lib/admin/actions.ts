"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { categories, type Category } from "./types";

async function adminClient() {
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) throw new Error("관리자만 사용할 수 있어요.");
  return supabase;
}

export type CreateProductInput = { name: string; maker: string; category: Category; description: string };

/** 제품 등록. 제조사명이 없으면 새로 만듭니다. */
export async function createProduct(input: CreateProductInput): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const supabase = await adminClient();
    const name = input.name.trim();
    const maker = input.maker.trim();
    if (!name || !maker || !categories.includes(input.category)) return { ok: false, error: "입력값을 확인해 주세요." };

    let { data: m } = await supabase.from("manufacturers").select("id").eq("name", maker).maybeSingle();
    if (!m) {
      const { data: created, error } = await supabase.from("manufacturers").insert({ name: maker }).select("id").single();
      if (error) return { ok: false, error: "제조사를 등록하지 못했어요." };
      m = created;
    }
    const { data: p, error } = await supabase
      .from("products")
      .insert({ manufacturer_id: m.id, name, category: input.category, description: input.description.trim() || null })
      .select("id")
      .single();
    if (error) return { ok: false, error: "제품을 등록하지 못했어요." };
    revalidatePath("/admin/products");
    revalidatePath("/admin/stickers");
    return { ok: true, id: p.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "오류가 발생했어요." };
  }
}

/** 스티커 발급: 시리얼 n 개를 "등록 대기" 상태로 만듭니다. 패턴 등록은 휴대폰 스캔 화면의 등록 모드에서 합니다. */
export async function issueStickers(productId: string, count: number): Promise<{ ok: true; serials: string[] } | { ok: false; error: string }> {
  try {
    const supabase = await adminClient();
    const n = Math.floor(Number(count));
    if (!productId || !Number.isFinite(n) || n < 1 || n > 500) return { ok: false, error: "제품과 수량(1~500)을 확인해 주세요." };
    const { data, error } = await supabase.rpc("issue_stickers", { p_product_id: productId, p_count: n });
    if (error || !data) return { ok: false, error: "발급에 실패했어요." };
    revalidatePath("/admin/stickers");
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    return { ok: true, serials: data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "오류가 발생했어요." };
  }
}
