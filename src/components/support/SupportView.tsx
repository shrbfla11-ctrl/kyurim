"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Clock, Mail, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { faqs, supportCategories, type SupportCategory } from "@/lib/support/mock";

const card = "rounded-[20px] bg-white shadow-card";
type Filter = "전체" | SupportCategory;

/** 고객센터 본문: 검색 · 카테고리 칩 · FAQ 아코디언 · 1:1 문의 안내 · 운영 정보 */
export function SupportView({ loggedIn }: { loggedIn: boolean }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Filter>("전체");
  const [open, setOpen] = useState<number>(0);

  const rows = useMemo(() => {
    const kw = q.toLowerCase();
    return faqs
      .map((f, idx) => ({ ...f, idx }))
      .filter((f) => (cat === "전체" || f.category === cat) && (!kw || `${f.q} ${f.a}`.toLowerCase().includes(kw)));
  }, [q, cat]);
  const groups = supportCategories.map((c) => ({ cat: c, items: rows.filter((r) => r.category === c) })).filter((g) => g.items.length);
  const noResults = rows.length === 0;

  return (
    <div className="flex flex-col gap-8 text-ink lg:gap-10">
      <div>
        <h1 className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em] lg:text-[32px]">고객센터</h1>
        <SearchInput placeholder="무엇을 도와드릴까요?" onSearch={setQ} className="mt-5 max-w-[560px]" />
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {(["전체", ...supportCategories] as Filter[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`h-9 flex-none rounded-full px-3.5 text-sm font-semibold transition-colors duration-300 hover:brightness-100 ${cat === c ? "bg-ink text-white" : "bg-gray-1 text-gray-6 hover:bg-gray-2"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {noResults ? (
        <div className={`${card} flex flex-col items-center gap-4 px-6 py-12 text-center`}>
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-1 text-gray-4"><SearchX size={28} /></span>
          <div>
            <div className="text-lg font-bold">&apos;<span className="text-blue">{q || cat}</span>&apos;에 대한 결과가 없어요</div>
            <p className="mt-2 text-[15px] leading-relaxed text-gray-5">검색어를 바꿔 보거나 아래에서 1:1 문의를 남겨 주세요.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:gap-8">
          {groups.map((g) => (
            <section key={g.cat}>
              <div className="px-1 pb-2.5 text-sm font-bold text-gray-4">{g.cat}</div>
              <div className={`${card} px-6`}>
                {g.items.map((f, i) => {
                  const isOpen = open === f.idx;
                  return (
                    <div key={f.idx} className={i === g.items.length - 1 ? "" : "border-b border-gray-1"}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpen(isOpen ? -1 : f.idx)}
                        className="flex w-full items-center justify-between gap-4 py-[18px] text-left hover:brightness-100"
                      >
                        <span className="flex items-start gap-2.5">
                          <span className="flex-none font-inter text-[15px] font-bold leading-normal text-blue">Q</span>
                          <span className="text-base font-semibold leading-normal">{f.q}</span>
                        </span>
                        <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full bg-gray-1 text-gray-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                          <ChevronDown size={16} strokeWidth={2.5} />
                        </span>
                      </button>
                      {isOpen && <div className="pb-[18px] pl-[26px] text-[15px] leading-relaxed text-gray-6">{f.a}</div>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className={`${card} flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between`}>
        <div>
          <div className="text-lg font-bold tracking-[-0.02em]">해결되지 않았나요?</div>
          <p className="mt-1 text-[15px] leading-relaxed text-gray-5">1:1 문의를 남기면 영업일 기준 1일 이내에 답변드려요.</p>
        </div>
        <div className="flex gap-2">
          <Button href={loggedIn ? "/support/inquiries" : "/login?next=/support/inquiries"} variant="ghost" size="md" className="flex-1 bg-gray-1 text-gray-6 lg:flex-none">문의 내역</Button>
          <Button href={loggedIn ? "/support/inquiry" : "/login?next=/support/inquiry"} size="md" className="flex-1 lg:flex-none">문의하기</Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-[20px] border border-gray-2 bg-[#F9FAFB] px-6 py-5 lg:grid-cols-2">
        <InfoRow Icon={Clock} label="운영 시간"><>평일 <span className="font-inter">10:00 – 18:00</span> (주말·공휴일 휴무)</></InfoRow>
        <InfoRow Icon={Mail} label="이메일"><span className="font-inter">admin@puf.com</span></InfoRow>
      </div>
    </div>
  );
}

function InfoRow({ Icon, label, children }: { Icon: typeof Clock; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border border-gray-2 bg-white text-blue"><Icon size={18} /></span>
      <div>
        <div className="text-[13px] text-gray-4">{label}</div>
        <div className="mt-0.5 text-[15px] font-semibold">{children}</div>
      </div>
    </div>
  );
}
