"use client";

import { useRef, useState, type FormEvent } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/Input";
import { supportCategories, type SupportCategory } from "@/lib/support/mock";

const card = "rounded-[20px] bg-white p-6 shadow-card";
const field = "h-14 w-full rounded-[14px] border-[1.5px] bg-gray-1 px-4 text-base text-ink outline-none transition-colors duration-300 focus:border-blue focus:bg-white";
const label = "mb-2 block text-sm font-semibold text-gray-6";
const MAX_BODY = 1000;
const MAX_FILES = 3;

type Errors = { category?: string; subject?: string; body?: string };

/** 1:1 문의 작성. 제출은 DB 연결 전까지 접수 번호를 만들어 완료 화면만 보여 줍니다. */
export function InquiryForm({ email, defaultCategory }: { email: string; defaultCategory?: SupportCategory }) {
  const [category, setCategory] = useState<"" | SupportCategory>(defaultCategory ?? "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs: Errors = {
      category: category ? undefined : "문의 유형을 선택해 주세요.",
      subject: subject.trim() ? undefined : "제목을 입력해 주세요.",
      body: body.trim().length >= 10 ? undefined : "내용을 10자 이상 입력해 주세요.",
    };
    setErrors(errs);
    if (errs.category || errs.subject || errs.body) return;
    setBusy(true);
    const d = new Date();
    const yymmdd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    window.setTimeout(() => {
      setTicket(`#PUF-${yymmdd}-${String(Math.floor(Math.random() * 9000) + 1000)}`);
      setBusy(false);
    }, 500);
  }

  if (ticket) {
    return (
      <div className="flex flex-col gap-6">
        <div className={`${card} flex flex-col items-center gap-5 px-6 py-10 text-center`}>
          <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-green-light text-green"><Check size={36} strokeWidth={2.5} /></span>
          <div>
            <h1 className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em] lg:text-[32px]">문의가 접수됐어요</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-gray-5">답변은 <strong className="font-inter font-semibold text-ink">{email}</strong>로 보내드려요.</p>
          </div>
          <div className="grid w-full grid-cols-2 gap-4 rounded-2xl bg-gray-1 p-4 text-left">
            <div><div className="text-[13px] text-gray-4">접수 번호</div><div className="mt-1 font-inter text-base font-bold">{ticket}</div></div>
            <div><div className="text-[13px] text-gray-4">예상 답변 시간</div><div className="mt-1 text-base font-bold">영업일 기준 1일 이내</div></div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button href="/support/inquiries" full>문의 내역 보기</Button>
          <Button href="/support" variant="secondary" full>고객센터로 돌아가기</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em] lg:text-[32px]">1:1 문의</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-gray-5">영업일 기준 1일 이내에 이메일로 답변드려요.</p>
      </div>

      <div className={`${card} flex flex-col gap-5`}>
        <label className="block">
          <span className={label}>문의 유형</span>
          <span className="relative block">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value as typeof category); setErrors({ ...errors, category: undefined }); }}
              className={`${field} appearance-none pr-11 ${errors.category ? "border-red" : "border-transparent"} ${category ? "" : "text-placeholder"}`}
            >
              <option value="">유형을 선택해 주세요</option>
              {supportCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={20} className="pointer-events-none absolute right-4 top-[18px] text-gray-4" />
          </span>
          {errors.category && <ErrorText>{errors.category}</ErrorText>}
        </label>

        <label className="block">
          <span className={label}>제목</span>
          <input
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setErrors({ ...errors, subject: undefined }); }}
            placeholder="문의 내용을 한 줄로 요약해 주세요"
            className={`${field} ${errors.subject ? "border-red" : "border-transparent"}`}
          />
          {errors.subject && <ErrorText>{errors.subject}</ErrorText>}
        </label>

        <label className="block">
          <span className={`${label} flex justify-between`}>내용<span className="font-inter font-normal text-gray-4">{body.length} / {MAX_BODY}</span></span>
          <textarea
            value={body}
            maxLength={MAX_BODY}
            onChange={(e) => { setBody(e.target.value); setErrors({ ...errors, body: undefined }); }}
            placeholder="발생한 상황, 기기·브라우저, 스캔한 제품명을 함께 적어 주시면 더 빠르게 도와드릴 수 있어요."
            className={`h-40 w-full resize-none rounded-[14px] border-[1.5px] bg-gray-1 px-4 py-3.5 text-base leading-relaxed text-ink outline-none transition-colors duration-300 focus:border-blue focus:bg-white ${errors.body ? "border-red" : "border-transparent"}`}
          />
          {errors.body && <ErrorText>{errors.body}</ErrorText>}
        </label>

        <div>
          <span className={label}>스크린샷 <span className="font-normal text-gray-4">(선택)</span></span>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={files.length >= MAX_FILES}
              className="flex h-[88px] w-[88px] flex-none flex-col items-center justify-center gap-1 rounded-[14px] border-[1.5px] border-dashed border-gray-3 bg-[#F9FAFB] text-gray-4 transition-colors duration-300 hover:border-blue hover:bg-blue-light hover:brightness-100 disabled:opacity-50"
            >
              <Plus size={22} />
              <span className="font-inter text-xs font-semibold">{files.length}/{MAX_FILES}</span>
            </button>
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} className="relative h-[88px] w-[88px] overflow-hidden rounded-[14px] bg-gradient-to-br from-[#EEF5FF] to-[#DCEBFF]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                <button type="button" aria-label="삭제" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="absolute right-1.5 top-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-ink text-white hover:brightness-100">
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ))}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg" multiple className="hidden" onChange={(e) => { setFiles([...files, ...Array.from(e.target.files ?? [])].slice(0, MAX_FILES)); e.target.value = ""; }} />
          </div>
          <div className="mt-2 text-[13px] text-gray-4">PNG · JPG, 최대 10MB</div>
        </div>

        <label className="block">
          <span className={label}>답변 받을 이메일</span>
          <input value={email} readOnly className={`${field} border-transparent font-inter text-gray-6`} />
          <span className="mt-2 block text-[13px] text-gray-4">로그인한 계정의 이메일이 자동으로 입력됐어요.</span>
        </label>
      </div>

      <Button type="submit" full loading={busy} loadingLabel="보내는 중...">문의 보내기</Button>
    </form>
  );
}
