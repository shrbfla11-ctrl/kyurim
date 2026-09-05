import { CheckIcon } from "@/components/icons";

// 카메라 인식 과정을 보여주는 스마트폰 목업 (6초 루프 애니메이션)
export function PhoneMockup() {
  const corner =
    "absolute h-7 w-7 border-blue lg:h-8 lg:w-8 [border-width:3px]";

  return (
    <div className="relative mx-auto h-[480px] w-[342px] overflow-hidden rounded-t-3xl lg:h-[600px] lg:w-full lg:rounded-[32px]">
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_100%,#DCEBFF_0%,#EEF5FF_55%,#FFFFFF_100%)] lg:bg-[radial-gradient(90%_80%_at_50%_100%,#DCEBFF_0%,#EEF5FF_55%,#FFFFFF_100%)]" />

      <div className="absolute left-1/2 top-6 h-[580px] w-[280px] -translate-x-1/2 rounded-[44px] bg-ink p-2.5 shadow-phone lg:top-12 lg:h-[620px] lg:w-[300px] lg:rounded-[48px] lg:p-3">
        <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-gradient-to-b from-[#E9EEF4] to-[#DAE1EA] lg:rounded-[38px]">
          <div className="absolute left-1/2 top-2.5 h-[26px] w-[88px] -translate-x-1/2 rounded-full bg-ink lg:top-3 lg:h-7 lg:w-24" />
          <div className="absolute inset-x-0 top-[52px] text-center text-xs font-semibold text-gray-5 lg:top-[60px] lg:text-[13px]">
            알약을 사각형 안에 맞춰 주세요
          </div>

          <div className="absolute left-10 top-[92px] h-[180px] w-[180px] lg:left-[38px] lg:top-[108px] lg:h-[200px] lg:w-[200px]">
            <span className={`${corner} left-0 top-0 rounded-tl-lg border-l border-t`} />
            <span className={`${corner} right-0 top-0 rounded-tr-lg border-r border-t`} />
            <span className={`${corner} bottom-0 left-0 rounded-bl-lg border-b border-l`} />
            <span className={`${corner} bottom-0 right-0 rounded-br-lg border-b border-r`} />

            <div className="absolute left-1/2 top-1/2 flex h-[52px] w-[120px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-b from-white to-[#EEF1F5] shadow-[0_8px_20px_rgba(25,31,40,0.16),inset_0_-3px_6px_rgba(0,0,0,0.06)] lg:h-14 lg:w-[132px]">
              <span className="font-inter text-sm font-bold tracking-[0.12em] text-gray-3 lg:text-[15px]">
                TYL 500
              </span>
              <span className="motion-safe-anim absolute inset-x-3.5 inset-y-3.5 animate-hl rounded-lg border-2 border-blue bg-blue/10 lg:inset-x-4" />
            </div>

            <div className="motion-safe-anim absolute inset-x-0 h-0.5 animate-scan bg-gradient-to-r from-blue/0 via-blue to-blue/0 shadow-[0_0_12px_2px_rgba(49,130,246,0.5)]" />
          </div>

          <div className="motion-safe-anim absolute right-9 top-[220px] flex h-11 w-11 animate-check items-center justify-center rounded-full bg-green text-white shadow-[0_8px_20px_rgba(20,184,102,0.35)] lg:top-[248px] lg:h-12 lg:w-12">
            <CheckIcon size={22} strokeWidth={2.5} />
          </div>

          <div className="motion-safe-anim absolute inset-x-3 top-[296px] animate-card rounded-[20px] bg-white p-4 shadow-[0_8px_24px_rgba(25,31,40,0.12)] lg:top-[328px]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-green-light px-2 py-1 text-[11px] font-bold text-green">
                98% 일치
              </span>
              <span className="text-[11px] text-gray-5">일반의약품</span>
            </div>
            <div className="mt-2 text-base font-bold text-ink lg:text-[17px]">
              타이레놀정 500mg
            </div>
            <div className="mt-0.5 text-xs text-gray-5">
              아세트아미노펜 500mg · 한국얀센
            </div>
            <div className="mt-2 flex gap-1">
              {["해열", "진통", "두통 완화"].map((t, i) => (
                <span
                  key={t}
                  className={`rounded-lg bg-blue-light px-2 py-1 text-[11px] font-semibold text-blue ${i === 2 ? "hidden lg:inline" : ""}`}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
