import { CheckIcon, WarningIcon } from "@/components/icons";

const tags = ["해열", "진통", "두통 완화"];

export function ResultPreview() {
  return (
    <section className="mt-16 bg-gray-1 py-14 lg:mt-24 lg:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-20">
        <div className="lg:text-center">
          <div className="text-[13px] font-bold text-blue lg:text-sm">인식 결과</div>
          <h2 className="mt-2 text-[28px] font-bold leading-[1.3] tracking-[-0.03em] lg:text-[32px]">
            이렇게 알려드려요
          </h2>
        </div>

        <div className="mt-6 rounded-[20px] bg-white p-6 shadow-card lg:mx-auto lg:mt-12 lg:grid lg:max-w-[1040px] lg:grid-cols-[400px_1fr] lg:gap-10 lg:rounded-3xl">
          <div className="relative flex h-40 items-center justify-center rounded-2xl bg-gradient-to-b from-[#EEF5FF] to-[#E3EEFF] lg:h-auto lg:min-h-[400px] lg:rounded-[20px]">
            <div className="flex h-[68px] w-[168px] items-center justify-center rounded-full bg-gradient-to-b from-white to-[#EEF1F5] font-inter text-lg font-bold tracking-[0.12em] text-gray-3 shadow-[0_12px_28px_rgba(25,31,40,0.16),inset_0_-4px_8px_rgba(0,0,0,0.06)] lg:h-[88px] lg:w-[220px] lg:text-[22px] lg:tracking-[0.14em]">
              TYL 500
            </div>
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-xs font-bold text-green shadow-card lg:right-4 lg:top-4 lg:text-[13px]">
              <CheckIcon size={14} />
              98% 일치
            </span>
            <span className="absolute bottom-4 left-4 hidden rounded-lg bg-white/80 px-2.5 py-1.5 text-xs text-gray-5 lg:block">
              촬영 이미지는 저장되지 않아요
            </span>
          </div>

          <div className="lg:py-4 lg:pr-4">
            <div className="mt-6 text-[13px] font-semibold text-gray-5 lg:mt-0 lg:text-sm">
              일반의약품 · 해열진통제
            </div>
            <div className="mt-1 text-2xl font-bold tracking-[-0.02em] lg:mt-2 lg:text-[32px] lg:tracking-[-0.03em]">
              타이레놀정 500mg
            </div>
            <div className="mt-1 text-[15px] text-gray-5 lg:mt-2 lg:text-[17px]">
              아세트아미노펜 500mg · 한국얀센
            </div>

            <div className="mt-4 flex flex-wrap gap-2 lg:mt-6">
              {tags.map((t) => (
                <span key={t} className="rounded-[10px] bg-blue-light px-3 py-2 text-[13px] font-semibold text-blue lg:px-3.5 lg:text-sm">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-1 pt-6 lg:mt-8 lg:grid-cols-3">
              <div>
                <div className="text-xs text-gray-5 lg:text-[13px]">모양</div>
                <div className="mt-1 text-[15px] font-semibold lg:text-base">장방형</div>
              </div>
              <div>
                <div className="text-xs text-gray-5 lg:text-[13px]">색상</div>
                <div className="mt-1 text-[15px] font-semibold lg:text-base">흰색</div>
              </div>
              <div className="col-span-2 lg:col-span-1">
                <div className="text-xs text-gray-5 lg:text-[13px]">식별 문자</div>
                <div className="mt-1 text-[15px] font-semibold lg:text-base">TYL 500</div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-amber-bg p-4 lg:mt-8 lg:px-6 lg:py-5">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-ink lg:text-[15px]">
                <WarningIcon size={18} />
                복용 시 주의
              </div>
              <p className="mt-2 text-sm leading-normal text-amber-text lg:text-[15px]">
                하루 최대 4,000mg을 초과하지 마세요. 음주 후 복용은 간 손상 위험을 높일 수 있어요.
                <span className="hidden lg:inline"> 다른 아세트아미노펜 함유 감기약과 함께 복용하지 마세요.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
