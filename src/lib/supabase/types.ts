// Supabase 스키마 타입. supabase/migrations 와 동일하게 손으로 유지합니다.
// (PUF 프로젝트는 CLI 타입 생성이 연결되어 있지 않습니다.)

export type UserRole = "user" | "admin" | "manufacturer";
export type ProductCategory = "스킨케어" | "전자기기" | "건강식품" | "패션잡화";
export type StickerStatus = "processing" | "done" | "failed" | "revoked";
export type ScanOutcome = "genuine" | "unverified" | "fake";
export type InquiryCategory = "스캔·인식" | "계정·로그인" | "결과·정품" | "제조사 도입" | "기타";
export type InquiryStatus = "wait" | "done";
export type MessageSender = "user" | "admin";

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];
export type ProductInfo = { title: string; body: string };

type Rel = { foreignKeyName: string; columns: string[]; isOneToOne: boolean; referencedRelation: string; referencedColumns: string[] };
type Row<T, R extends Rel[] = []> = { Row: T; Insert: Partial<T>; Update: Partial<T>; Relationships: R };
const rel = <const R extends Rel[]>(r: R) => r;
export const relationships = {
  products: rel([{ foreignKeyName: "products_manufacturer_id_fkey", columns: ["manufacturer_id"], isOneToOne: false, referencedRelation: "manufacturers", referencedColumns: ["id"] }]),
  stickers: rel([{ foreignKeyName: "stickers_product_id_fkey", columns: ["product_id"], isOneToOne: false, referencedRelation: "products", referencedColumns: ["id"] }]),
  scan_records: rel([{ foreignKeyName: "scan_records_sticker_id_fkey", columns: ["sticker_id"], isOneToOne: false, referencedRelation: "stickers", referencedColumns: ["id"] }]),
  inquiry_messages: rel([{ foreignKeyName: "inquiry_messages_inquiry_id_fkey", columns: ["inquiry_id"], isOneToOne: false, referencedRelation: "inquiries", referencedColumns: ["id"] }]),
};

export type Database = {
  public: {
    Tables: {
      profiles: Row<{ id: string; role: UserRole; email: string | null; name: string | null; avatar_url: string | null; marketing_opt_in: boolean; created_at: string; updated_at: string }>;
      manufacturers: Row<{ id: string; name: string; contact_email: string | null; created_at: string }>;
      products: Row<{
        id: string; manufacturer_id: string; name: string; category: ProductCategory; description: string | null;
        image_url: string | null; info: ProductInfo[]; created_at: string; updated_at: string;
      }, typeof relationships.products>;
      stickers: Row<{
        id: string; serial: string; product_id: string; lot: string | null; pattern_ref: string | null; pattern_hash: string | null;
        pattern_signature: Json | null;
        status: StickerStatus; issued_at: string; scan_count: number; first_scanned_at: string | null;
      }, typeof relationships.stickers>;
      scan_records: Row<{
        id: string; user_id: string | null; sticker_id: string | null; outcome: ScanOutcome; score: number | null;
        count_at_scan: number; region: string | null; scanned_at: string;
        charge_ms: number | null; frame_count: number | null; frame_interval_ms: number | null; beads: number | null; matched: number | null;
      }, typeof relationships.scan_records>;
      inquiries: Row<{
        id: string; ticket: string; user_id: string; category: InquiryCategory; subject: string; status: InquiryStatus;
        created_at: string; updated_at: string;
      }>;
      inquiry_messages: Row<{
        id: string; inquiry_id: string; sender: MessageSender; sender_id: string | null; body: string; attachments: string[]; created_at: string;
      }, typeof relationships.inquiry_messages>;
      faqs: Row<{ id: string; category: InquiryCategory; question: string; answer: string; sort_order: number; published: boolean }>;
    };
    Views: {
      dashboard_stats: {
        Row: { scans_today: number; scans_yesterday: number; genuine_rate_7d: number; suspected_24h: number; stickers_issued: number; stickers_issued_month: number };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      delete_my_account: { Args: Record<string, never>; Returns: undefined };
      enroll_sticker: { Args: { p_serial: string; p_signature: Json }; Returns: undefined };
      list_signatures: { Args: Record<string, never>; Returns: { serial: string; signature: Json }[] };
      issue_stickers: { Args: { p_product_id: string; p_count: number }; Returns: string[] };
      pick_placeholder_sticker: { Args: Record<string, never>; Returns: string | null };
      record_scan: {
        Args: { p_serial: string | null; p_outcome: ScanOutcome; p_score?: number | null; p_region?: string | null; p_charge_ms?: number | null; p_frame_count?: number | null; p_frame_interval_ms?: number | null; p_beads?: number | null; p_matched?: number | null };
        Returns: string;
      };
      scan_result: { Args: { p_id: string }; Returns: ScanResultJson | null };
      scan_history: {
        Args: Record<string, never>;
        Returns: { id: string; outcome: ScanOutcome; scanned_at: string; product_name: string | null; maker_name: string | null }[];
      };
    };
    Enums: {
      user_role: UserRole; product_category: ProductCategory; sticker_status: StickerStatus; scan_outcome: ScanOutcome;
      inquiry_category: InquiryCategory; inquiry_status: InquiryStatus; message_sender: MessageSender;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type ScanResultJson = {
  id: string;
  outcome: ScanOutcome;
  scannedAt: string;
  count: number;
  firstScanAt: string;
  serial: string | null;
  lot: string | null;
  product: { name: string; category: ProductCategory; maker: string; imageUrl: string | null; info: ProductInfo[] } | null;
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
