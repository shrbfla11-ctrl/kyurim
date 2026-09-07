"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supportCategories, type SupportCategory } from "./content";

const MAX_FILES = 3;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

async function uploadAttachments(userId: string, inquiryId: string, files: File[]) {
  const supabase = await createClient();
  const paths: string[] = [];
  for (const f of files.slice(0, MAX_FILES)) {
    if (f.size === 0 || f.size > MAX_FILE_BYTES) continue;
    const safe = f.name.replace(/[^\w.-]+/g, "_");
    const path = `${userId}/${inquiryId}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from("inquiry-attachments").upload(path, f);
    if (!error) paths.push(path);
  }
  return paths;
}

/** 1:1 문의 접수. 접수 번호는 DB 트리거가 만듭니다. */
export async function createInquiry(form: FormData): Promise<{ ok: true; id: string; ticket: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요해요." };

  const category = String(form.get("category") ?? "") as SupportCategory;
  const subject = String(form.get("subject") ?? "").trim();
  const body = String(form.get("body") ?? "").trim();
  if (!supportCategories.includes(category) || !subject || body.length < 10) return { ok: false, error: "입력값을 확인해 주세요." };

  const { data: inquiry, error } = await supabase
    .from("inquiries")
    .insert({ user_id: user.id, category, subject })
    .select("id, ticket")
    .single();
  if (error || !inquiry) return { ok: false, error: "문의를 접수하지 못했어요. 잠시 후 다시 시도해 주세요." };

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  const attachments = await uploadAttachments(user.id, inquiry.id, files);
  const { error: mErr } = await supabase
    .from("inquiry_messages")
    .insert({ inquiry_id: inquiry.id, sender: "user", sender_id: user.id, body, attachments });
  if (mErr) return { ok: false, error: "문의 내용을 저장하지 못했어요." };

  revalidatePath("/support/inquiries");
  return { ok: true, id: inquiry.id, ticket: inquiry.ticket };
}

/** 기존 문의에 추가 메시지 */
export async function addInquiryMessage(inquiryId: string, body: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "로그인이 필요해요." };
  const text = body.trim();
  if (!text) return { ok: false, error: "내용을 입력해 주세요." };
  const { data: isAdmin } = await supabase.rpc("is_admin");
  const { error } = await supabase
    .from("inquiry_messages")
    .insert({ inquiry_id: inquiryId, sender: isAdmin ? "admin" : "user", sender_id: user.id, body: text });
  if (error) return { ok: false, error: "메시지를 보내지 못했어요." };
  revalidatePath("/support/inquiries");
  return { ok: true };
}
