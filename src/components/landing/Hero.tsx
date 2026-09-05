import { CameraIcon, CheckIcon } from "@/components/icons";
import { PhoneMockup } from "./PhoneMockup";

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 pt-8 text-center lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-20 lg:pt-16 lg:text-left">
      <div>
        <div className="inline-flex h-8 items-center gap-2 rounded-full bg-blue-light px-3 text-[13px] font-semibold text-blue">
          <span className="h-1.5 w-1.5 rounded-full bg-blue" />
          식약처 공공데이터 기반
        </div>
        <h1 className="mt-4 text-[32px] font-bold leading-[1.3] tracking-[-0.03em] text-ink lg:mt-6 lg:text-[40px]">
          카메라를 알약에 비추면
          <br />
          바로 알 수 있어요
        </h1>
        <p className="mt-4 text-base leading-normal text-gray-5 lg:max-w-[480px] lg:text-[17px]">
          알약 표면의 식별 문자만으로 성분, 효능,
          <br className="lg:hidden" /> 주의사항까지 한 번에 확인하세요.
        </p>

        <div className="mt-6 flex flex-col gap-2 lg:mt-10 lg:flex-row">
          <a
            href="#cta"
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue px-7 text-[17px] font-bold text-white hover:bg-blue-dark"
          >
            <CameraIcon size={22} />
            카메라로 알약 인식하기
          </a>
          <a
            href="#search"
            className="flex h-14 items-center justify-center rounded-2xl bg-blue-light px-7 text-[17px] font-bold text-blue hover:bg-[#d9eaff]"
          >
            식별 문자로 검색
          </a>
        </div>

        <div className="mt-10 hidden gap-6 text-sm text-gray-5 lg:flex">
          {["사진 미저장", "가입 없이 이용"].map((t) => (
            <span key={t} className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-light text-green">
                <CheckIcon size={12} />
              </span>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 lg:mt-0">
        <PhoneMockup />
      </div>
    </section>
  );
}
