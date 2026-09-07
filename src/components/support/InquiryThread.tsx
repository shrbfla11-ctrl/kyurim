"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Paperclip, Send, X } from "lucide-react";
import type { Inquiry, InquiryMessage } from "@/lib/support/content";
import { addInquiryMessage } from "@/lib/support/actions";

const MAX_FILES = 5;
const card = "rounded-[20px] bg-white shadow-card";

function isImage(url: string) {
  return /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url);
}

function Attachments({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((url, i) =>
        isImage(url) ? (
          <a key={url} href={url} target="_blank" rel="noreferrer" className="block h-[72px] w-[72px] overflow-hidden rounded-xl bg-gray-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="첨부 이미지" className="h-full w-full object-cover" />
          </a>
        ) : (
          <a key={url} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-xl bg-gray-1 px-3 py-2 text-[13px] font-semibold text-gray-6 hover:bg-gray-2">
            <Paperclip size={14} />첨부 파일 {i + 1}
          </a>
        ),
      )}
    </div>
  );
}

/**
 * 문의 대화 스레드 + 메시지 작성. 사용자 화면과 관리자 화면이 함께 씁니다.
 * viewer 가 admin 이면 관리자 말풍선이 오른쪽(파란색)에 옵니다.
 */
export function InquiryThread({ inquiry, viewer, placeholder }: { inquiry: Inquiry; viewer: "user" | "admin"; placeholder: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function send() {
    if (busy || (!text.trim() && files.length === 0)) return;
    setBusy(true);
    setError(null);
    const form = new FormData();
    form.append("inquiryId", inquiry.id);
    form.append("body", text);
    files.forEach((f) => form.append("files", f));
    const res = await addInquiryMessage(form);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setText("");
    setFiles([]);
    router.refresh();
  }

  const mine = (m: InquiryMessage) => m.from === viewer;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 py-2">
        {inquiry.messages.map((m) =>
          mine(m) ? (
            <div key={m.id} className="flex flex-col items-end gap-1.5">
              <div className="max-w-full whitespace-pre-line rounded-[20px_20px_4px_20px] bg-blue px-[18px] py-3.5 text-[15px] leading-relaxed text-white lg:max-w-[560px]">{m.body}</div>
              <Attachments items={m.attachments} />
              <span className="font-inter text-xs text-gray-4">{m.at}</span>
            </div>
          ) : (
            <div key={m.id} className="flex items-end gap-2.5">
              <span className="flex h-8 w-8 flex-none items-center justify-center overflow-hidden rounded-full border border-gray-2 bg-white text-xs font-bold text-blue">
                {m.from === "admin" ? <Image src="/puf-logo.png" alt="PUF" width={951} height={598} className="h-3 w-auto" /> : (inquiry.user?.name ?? inquiry.user?.email ?? "고객").slice(0, 1).toUpperCase()}
              </span>
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="text-[13px] font-semibold text-gray-6">{m.from === "admin" ? "PUF 고객센터" : inquiry.user?.name ?? inquiry.user?.email ?? "고객"}</span>
                <div className="max-w-full whitespace-pre-line rounded-[20px_20px_20px_4px] bg-white px-[18px] py-3.5 text-[15px] leading-relaxed text-ink shadow-card lg:max-w-[560px]">{m.body}</div>
                <Attachments items={m.attachments} />
                <span className="font-inter text-xs text-gray-4">{m.at}</span>
              </div>
            </div>
          ),
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(); }} className={`${card} flex flex-col gap-2 py-3 pl-5 pr-3`}>
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {files.map((f, i) => (
              <span key={`${f.name}-${i}`} className="flex items-center gap-1.5 rounded-lg bg-gray-1 px-2.5 py-1.5 text-[13px] font-semibold text-gray-6">
                <Paperclip size={13} />
                <span className="max-w-[160px] truncate">{f.name}</span>
                <button type="button" aria-label="삭제" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-gray-4 hover:text-ink hover:brightness-100"><X size={13} strokeWidth={3} /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder={error ?? placeholder} className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none" />
          <button
            type="button"
            aria-label="파일 첨부"
            onClick={() => fileRef.current?.click()}
            disabled={busy || files.length >= MAX_FILES}
            className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-gray-1 text-gray-6 transition duration-300 hover:bg-gray-2 hover:brightness-100 disabled:opacity-50"
          >
            <Paperclip size={20} />
          </button>
          <button type="submit" aria-label="보내기" disabled={busy} className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-blue text-white transition duration-300 hover:bg-blue-dark disabled:opacity-50">
            <Send size={20} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf,.txt,.log,.zip"
            multiple
            className="hidden"
            onChange={(e) => { setFiles([...files, ...Array.from(e.target.files ?? [])].slice(0, MAX_FILES)); e.target.value = ""; }}
          />
        </div>
        <span className="text-xs text-gray-4">이미지 · PDF 등 최대 {MAX_FILES}개, 파일당 10MB</span>
      </form>
    </div>
  );
}
