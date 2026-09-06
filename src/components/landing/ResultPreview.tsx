import { CheckIcon, WarningIcon } from "@/components/icons";

const tags = ["정품 확인", "첫 스캔", "유통 정상"];

export function ResultPreview() {
  return (
    <section className="mt-16 bg-gray-1 py-14 lg:mt-24 lg:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-20">
        <div className="lg:text-center">
          <div className="text-[13px] font-bold text-blue lg:text-sm">스캔 결과</div>
          <h2 className="mt-2 text-[28px] font-bold leading-[1.3] tracking-[-0.03em] lg:text-[32px]">
            이렇게 알려드려요
          </h2>
        </div>

        <div className="mt-6 rounded-[20px] bg-white p-6 shadow-card lg:mx-auto lg:mt-12 lg:grid lg:max-w-[1040px] lg:grid-cols-[400px_1fr] lg:gap-10 lg:rounded-3xl">
          <div className="relative flex h-40 items-center justify-center rounded-2xl bg-gradient-to-b from-[#EEF5FF] to-[#E3EEFF] lg:h-auto lg:min-h-[400px] lg:rounded-[20px]">
            <div className="relative flex h-[120px] w-[120px] items-center justify-center rounded-[20px] bg-white shadow-[0_12px_28px_rgba(25,31,40,0.16)] lg:h-[180px] lg:w-[180px] lg:rounded-3xl">
              <span className="absolute inset-3 rounded-xl bg-[radial-gradient(circle,#b8c0cb_1.3px,transparent_1.5px)] [background-size:10px_10px] opacity-70 lg:inset-4 lg:rounded-2xl" />
              <span className="relative rounded-md bg-white px-2.5 py-1 font-inter text-lg font-bold tracking-[0.12em] text-gray-3 lg:text-[22px] lg:tracking-[0.14em]">
                PUF
              </span>
            </div>
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-xs font-bold text-green shadow-card lg:right-4 lg:top-4 lg:text-[13px]">
              <CheckIcon size={14} />
              정품 인증
            </span>
            <span className="absolute bottom-4 left-4 hidden rounded-lg bg-white/80 px-2.5 py-1.5 text-xs text-gray-5 lg:block">
              촬영 이미지는 저장되지 않아요
            </span>
          </div>

          <div className="lg:py-4 lg:pr-4">
            <div className="mt-6 text-[13px] font-semibold text-gray-5 lg:mt-0 lg:text-sm">
              화장품 · 스킨케어
            </div>
            <div className="mt-1 text-2xl font-bold tracking-[-0.02em] lg:mt-2 lg:text-[32px] lg:tracking-[-0.03em]">
              프리미엄 세럼 50ml
            </div>
            <div className="mt-1 text-[15px] text-gray-5 lg:mt-2 lg:text-[17px]">
              PUF 코스메틱 · 제조번호 A2609-0815
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
                <div className="text-xs text-gray-5 lg:text-[13px]">인증 상태</div>
                <div className="mt-1 text-[15px] font-semibold text-green lg:text-base">정품</div>
              </div>
              <div>
                <div className="text-xs text-gray-5 lg:text-[13px]">스캔 횟수</div>
                <div className="mt-1 text-[15px] font-semibold lg:text-base">1회</div>
              </div>
              <div className="col-span-2 lg:col-span-1">
                <div className="text-xs text-gray-5 lg:text-[13px]">최초 스캔</div>
                <div className="mt-1 text-[15px] font-semibold lg:text-base">2026.09.06</div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-amber-bg p-4 lg:mt-8 lg:px-6 lg:py-5">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-ink lg:text-[15px]">
                <WarningIcon size={18} />
                이런 경우 주의하세요
              </div>
              <p className="mt-2 text-sm leading-normal text-amber-text lg:text-[15px]">
                같은 스티커가 여러 번 스캔되었거나 패턴 대조에 실패하면 위조·재사용 가능성이 있어요.
                <span className="hidden lg:inline"> 이런 결과가 나오면 구매처나 제조사에 문의해 주세요.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
