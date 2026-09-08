"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Camera, Check, ChevronDown, ChevronRight, CircleHelp, Clock, Info, Lock, ScanLine, SearchX, ShieldCheck, TriangleAlert, UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { guideSections, guideSteps, type GuideSection } from "@/lib/support/content";
import { PermissionMock } from "@/components/support/PermissionMock";

const card = "rounded-[20px] bg-white shadow-card";

const sectionIcon: Record<GuideSection["key"], typeof Camera> = {
  prep: Camera,
  result: ShieldCheck,
  unverified: CircleHelp,
  fake: TriangleAlert,
  history: Clock,
  privacy: Lock,
};
const stepIcon = [UserRound, ScanLine, Check];

/** 이용 가이드 본문. 모바일은 아코디언, 데스크톱(lg)은 좌측 목차 + 전체 펼침. */
export function GuideView() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(0);

  const matched = useMemo(() => {
    const kw = q.toLowerCase();
    if (!kw) return guideSections;
    return guideSections.filter((s) => `${s.title} ${s.paras.join(" ")} ${(s.tips ?? []).join(" ")}`.toLowerCase().includes(kw));
  }, [q]);
  const noResults = q.length > 0 && matched.length === 0;

  return (
    <div className="flex flex-col gap-10 text-ink lg:gap-14">
      <div>
        <h1 className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em] lg:text-[32px]">이용 가이드</h1>
        <p className="mt-2 text-base leading-relaxed text-gray-5">스티커 스캔부터 결과 확인까지, 3분이면 익힐 수 있어요</p>
        <SearchInput placeholder="궁금한 내용을 검색해 보세요" onSearch={setQ} className="mt-5 max-w-[560px]" />
      </div>

      {noResults ? (
        <div className={`${card} flex flex-col items-center gap-4 px-6 py-12 text-center`}>
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-1 text-gray-4"><SearchX size={28} /></span>
          <div>
            <div className="text-lg font-bold">&apos;<span className="text-blue">{q}</span>&apos;에 대한 결과가 없어요</div>
            <p className="mt-2 text-[15px] leading-relaxed text-gray-5">다른 검색어로 다시 시도하거나 고객센터에 문의해 주세요.</p>
          </div>
          <Button href="/support" variant="secondary" size="md">고객센터 문의</Button>
        </div>
      ) : (
        <>
          <section>
            <div className="text-[13px] font-bold text-blue">빠른 시작</div>
            <h2 className="mt-1.5 text-2xl font-bold tracking-[-0.03em]">세 단계로 시작해요</h2>
            <div className="mt-5 flex gap-4 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:overflow-visible">
              {guideSteps.map((s, i) => {
                const Icon = stepIcon[i];
                return (
                  <div key={s.n} className={`${card} flex w-[260px] flex-none flex-col gap-4 p-6 lg:w-auto`}>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue font-inter text-[13px] font-bold text-white">{s.n}</span>
                    <div className="flex h-[120px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#EEF5FF] to-[#DCEBFF] text-blue"><Icon size={44} /></div>
                    <div>
                      <div className="text-lg font-bold tracking-[-0.02em]">{s.title}</div>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-gray-5">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button href="/scan" full icon={<ScanLine size={20} />} className="mt-5 lg:w-auto">바로 스캔하기</Button>
          </section>

          <section>
            <div className="text-[13px] font-bold text-blue">상세 가이드</div>
            <h2 className="mt-1.5 text-2xl font-bold tracking-[-0.03em]">차근차근 알아보기</h2>
            <div className="mt-5 lg:grid lg:grid-cols-[220px_1fr] lg:items-start lg:gap-10">
              <nav className="hidden lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-1">
                {guideSections.map((s, i) => (
                  <a
                    key={s.key}
                    href={`#guide-${s.key}`}
                    onClick={() => setOpen(i)}
                    className={`h-11 rounded-xl px-3.5 text-left text-[15px] font-semibold leading-[44px] transition-colors duration-300 ${open === i ? "bg-blue-light text-blue" : "text-gray-6 hover:bg-gray-1"}`}
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
              <div className="flex flex-col gap-2 lg:gap-4">
                {matched.map((s) => {
                  const i = guideSections.indexOf(s);
                  const isOpen = open === i;
                  const Icon = sectionIcon[s.key];
                  return (
                    <div key={s.key} id={`guide-${s.key}`} className={`${card} overflow-hidden scroll-mt-6`}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpen(isOpen ? -1 : i)}
                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left hover:brightness-100 lg:cursor-default"
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-light text-blue"><Icon size={20} /></span>
                          <span className="text-lg font-bold tracking-[-0.02em]">{s.title}</span>
                        </span>
                        <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full bg-gray-1 text-gray-5 transition-transform duration-300 lg:hidden ${isOpen ? "rotate-180" : ""}`}>
                          <ChevronDown size={16} strokeWidth={2.5} />
                        </span>
                      </button>
                      <div className={`${isOpen ? "flex" : "hidden"} flex-col gap-4 px-6 pb-6 lg:flex`}>
                        {s.paras.map((p) => <p key={p} className="text-base leading-relaxed text-gray-6">{p}</p>)}
                        {s.key === "prep" && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {(
                              [
                                ["iOS", "처음 스캔할 때 뜨는 팝업에서 '허용'을 누르세요. 실수로 막았다면 설정 → Safari → 카메라 → 허용"],
                                ["Android", "처음 스캔할 때 뜨는 팝업에서 '허용'을 누르세요. 실수로 막았다면 주소창 자물쇠 → 권한 → 카메라 허용"],
                              ] as const
                            ).map(([os, how]) => (
                              <div key={os} className="flex flex-col gap-3 rounded-2xl bg-gray-1 p-4">
                                <span className="font-inter text-[13px] font-bold text-gray-5">{os}</span>
                                <PermissionMock os={os} />
                                <span className="text-sm leading-normal text-gray-6">{how}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {s.key === "result" && (
                          <>
                            <div className="grid gap-3 lg:grid-cols-3">
                              <ResultBadgeCard bg="bg-green-light" fg="text-green" text="text-[#1F5A3C]" label="정품 확인" desc="등록된 원본 패턴과 일치해요. 안심하고 사용하세요." />
                              <ResultBadgeCard bg="bg-amber-bg" fg="text-amber-dark" text="text-amber-text" label="확인 불가" desc="패턴을 충분히 읽지 못했어요. 다시 스캔해 주세요." />
                              <ResultBadgeCard bg="bg-red-light" fg="text-red" text="text-red-text" label="위조 의심" desc="원본 패턴과 일치하지 않아요. 구매처에 문의해 주세요." />
                            </div>
                            <div className="flex items-start gap-3 rounded-2xl bg-gray-1 p-4">
                              <Info size={18} className="mt-0.5 flex-none text-gray-5" />
                              <p className="text-sm leading-relaxed text-gray-6"><strong className="text-ink">누적 스캔 횟수 경고</strong> — 같은 스티커가 여러 번 스캔되면 스티커가 재사용되었을 가능성이 있어요. 정품으로 표시되더라도 횟수가 많으면 구매처를 확인해 주세요.</p>
                            </div>
                          </>
                        )}
                        {s.key === "privacy" && (
                          <div className="flex items-start gap-3.5 rounded-2xl bg-green-light p-5">
                            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[14px] bg-white text-green"><ShieldCheck size={22} /></span>
                            <div>
                              <div className="text-base font-bold text-[#1F5A3C]">촬영 이미지는 절대 저장되지 않아요</div>
                              <p className="mt-1.5 text-sm leading-relaxed text-[#1F5A3C]">이미지는 패턴 대조 직후 즉시 삭제되며 서버에 남지 않아요. 스캔 기록에는 결과 정보만 저장돼요.</p>
                            </div>
                          </div>
                        )}
                        {s.tips && (
                          <ul className="flex flex-col gap-2.5">
                            {s.tips.map((t) => (
                              <li key={t} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-gray-6">
                                <span className="mt-1.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full bg-blue-light text-blue"><Check size={11} strokeWidth={3.5} /></span>
                                {t}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <Link href="/support" className="flex items-center justify-between gap-4 rounded-[20px] bg-blue p-6 text-white transition duration-300 hover:bg-blue-dark">
            <span>
              <span className="block text-lg font-bold tracking-[-0.02em]">더 궁금한 점이 있나요?</span>
              <span className="mt-1 block text-sm text-white/85">고객센터에서 자주 묻는 질문을 확인하거나 1:1 문의를 남겨 주세요.</span>
            </span>
            <ChevronRight size={24} className="flex-none" />
          </Link>
        </>
      )}
    </div>
  );
}

function ResultBadgeCard({ bg, fg, text, label, desc }: { bg: string; fg: string; text: string; label: string; desc: string }) {
  return (
    <div className={`rounded-2xl p-4 ${bg}`}>
      <span className={`inline-block rounded-full bg-white px-2.5 py-1 text-[13px] font-bold ${fg}`}>{label}</span>
      <p className={`mt-2.5 text-sm leading-relaxed ${text}`}>{desc}</p>
    </div>
  );
}
