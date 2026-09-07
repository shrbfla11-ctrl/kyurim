import { createClient } from "@/lib/supabase/server";
import { formatInquiryDate, type Faq, type Inquiry, type InquiryMessage } from "./content";

export async function listFaqs(): Promise<Faq[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("faqs").select("category, question, answer").eq("published", true).order("sort_order");
  return (data ?? []).map((f) => ({ category: f.category, q: f.question, a: f.answer }));
}

type Attachment = { path: string; url: string };

/** 첨부 파일 경로를 1시간짜리 서명 URL 로 바꿉니다. */
async function signAttachments(paths: string[]): Promise<Attachment[]> {
  if (paths.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase.storage.from("inquiry-attachments").createSignedUrls(paths, 3600);
  return (data ?? []).flatMap((d) => (d.signedUrl ? [{ path: d.path ?? "", url: d.signedUrl }] : []));
}

/** 내 문의 목록 (첫 메시지를 미리보기로 사용) */
export async function listInquiries(): Promise<Inquiry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("inquiries")
    .select("id, ticket, category, subject, status, created_at, inquiry_messages(body, created_at)")
    .order("created_at", { ascending: false });
  return (data ?? []).map((i) => {
    const msgs = [...(i.inquiry_messages as { body: string; created_at: string }[])].sort((a, b) => a.created_at.localeCompare(b.created_at));
    return {
      id: i.id,
      ticket: i.ticket,
      category: i.category,
      date: formatInquiryDate(i.created_at),
      subject: i.subject,
      preview: msgs[0]?.body ?? "",
      status: i.status,
      messages: [],
    };
  });
}

/** 문의 상세 (메시지 + 첨부 서명 URL). 본인 것이 아니면 null. */
export async function getInquiry(id: string): Promise<Inquiry | null> {
  const supabase = await createClient();
  const { data: i } = await supabase.from("inquiries").select("id, ticket, category, subject, status, created_at").eq("id", id).maybeSingle();
  if (!i) return null;
  const { data: rows } = await supabase
    .from("inquiry_messages")
    .select("id, sender, body, attachments, created_at")
    .eq("inquiry_id", id)
    .order("created_at");
  const messages: InquiryMessage[] = [];
  for (const m of rows ?? []) {
    const signed = await signAttachments(m.attachments);
    messages.push({ id: m.id, from: m.sender, body: m.body, at: formatInquiryDate(m.created_at, true), attachments: signed.map((a) => a.url) });
  }
  return {
    id: i.id,
    ticket: i.ticket,
    category: i.category,
    date: formatInquiryDate(i.created_at),
    subject: i.subject,
    preview: messages[0]?.body ?? "",
    status: i.status,
    messages,
  };
}

// ---------- 관리자 ----------

export type InquiryFilter = "all" | "wait" | "done";

/** 전체 문의 목록 (관리자). RLS 로 관리자만 전체가 보입니다. */
export async function listAllInquiries(filter: InquiryFilter = "all"): Promise<Inquiry[]> {
  const supabase = await createClient();
  let q = supabase
    .from("inquiries")
    .select("id, ticket, category, subject, status, created_at, user_id, inquiry_messages(body, created_at)")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (filter !== "all") q = q.eq("status", filter);
  const { data } = await q;
  const rows = data ?? [];
  const ids = [...new Set(rows.map((r) => r.user_id))];
  const { data: profiles } = ids.length ? await supabase.from("profiles").select("id, name, email").in("id", ids) : { data: [] };
  const byId = new Map((profiles ?? []).map((p) => [p.id, { name: p.name, email: p.email }]));
  return rows.map((i) => {
    const msgs = [...(i.inquiry_messages as { body: string; created_at: string }[])].sort((a, b) => a.created_at.localeCompare(b.created_at));
    return {
      id: i.id,
      ticket: i.ticket,
      category: i.category,
      date: formatInquiryDate(i.created_at),
      subject: i.subject,
      preview: msgs[0]?.body ?? "",
      status: i.status,
      messages: [],
      user: byId.get(i.user_id) ?? { name: null, email: null },
    };
  });
}

/** 문의 상세 + 문의자 정보 (관리자) */
export async function getInquiryForAdmin(id: string): Promise<Inquiry | null> {
  const supabase = await createClient();
  const [detail, { data: i }] = await Promise.all([getInquiry(id), supabase.from("inquiries").select("user_id").eq("id", id).maybeSingle()]);
  if (!detail || !i) return null;
  const { data: p } = await supabase.from("profiles").select("name, email").eq("id", i.user_id).maybeSingle();
  return { ...detail, user: { name: p?.name ?? null, email: p?.email ?? null } };
}
