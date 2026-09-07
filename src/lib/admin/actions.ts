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

/**
 * 스티커 발급. 패턴 파일을 sticker-patterns 버킷에 올리고 stickers 행을 만듭니다.
 * 패턴 등록 엔진이 연결되기 전까지 상태는 업로드 성공 여부로만 정해집니다.
 */
export async function issueStickers(form: FormData): Promise<{ ok: true; done: number; failed: number } | { ok: false; error: string }> {
  try {
    const supabase = await adminClient();
    const productId = String(form.get("productId") ?? "");
    const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (!productId || files.length === 0) return { ok: false, error: "제품과 파일을 선택해 주세요." };

    const { data: product } = await supabase.from("products").select("id, manufacturers(name)").eq("id", productId).single();
    if (!product) return { ok: false, error: "제품을 찾을 수 없어요." };
    const makerCode = ((product.manufacturers as { name: string } | null)?.name ?? "PU").slice(0, 2).toUpperCase().replace(/[^A-Z]/g, "X");
    const yy = String(new Date().getFullYear()).slice(2);
    const { count } = await supabase.from("stickers").select("id", { count: "exact", head: true }).eq("product_id", productId);
    let seq = (count ?? 0) + 1;

    let done = 0;
    let failed = 0;
    for (const file of files) {
      const serial = `PUF-${makerCode}${yy}-${String(seq++).padStart(6, "0")}`;
      const path = `${productId}/${serial}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("sticker-patterns").upload(path, file, { upsert: false });
      const { error } = await supabase.from("stickers").insert({
        serial,
        product_id: productId,
        lot: `${makerCode}${yy}-${new Date().toISOString().slice(5, 10).replace("-", "")}`,
        pattern_ref: upErr ? null : path,
        status: upErr ? "failed" : "done",
      });
      if (error || upErr) failed++;
      else done++;
    }
    revalidatePath("/admin/stickers");
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    return { ok: true, done, failed };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "오류가 발생했어요." };
  }
}
