import { CameraIcon, InfoIcon, ScanIcon } from "@/components/icons";

const steps = [
  {
    Icon: CameraIcon,
    title: "알약에 카메라를 비추세요",
    desc: "밝은 곳에서 알약 앞면의 식별 문자가 보이도록 맞춰 주세요.",
  },
  {
    Icon: ScanIcon,
    title: "식별 문자·색상·모양을 자동 인식",
    desc: "각인과 코팅 문자를 읽고 색상·모양을 함께 비교해 후보 알약을 찾아요.",
  },
  {
    Icon: InfoIcon,
    title: "성분·효능·주의사항 확인",
    desc: "식약처 공공데이터 기반 정보를 바로 보여드려요.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto w-full max-w-[1440px] px-6 pt-16 lg:px-20 lg:pt-24">
      <div className="lg:text-center">
        <div className="text-[13px] font-bold text-blue lg:text-sm">이용 방법</div>
        <h2 className="mt-2 text-[28px] font-bold leading-[1.3] tracking-[-0.03em] lg:text-[32px]">
          세 단계면 충분해요
        </h2>
      </div>

      <div className="mt-6 flex flex-col gap-4 lg:mt-12 lg:grid lg:grid-cols-3 lg:gap-6">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className="flex items-start gap-4 rounded-[20px] bg-white p-6 shadow-card lg:block lg:px-6 lg:py-8"
          >
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-[14px] bg-blue-light text-blue lg:h-14 lg:w-14 lg:rounded-2xl">
              <s.Icon className="lg:h-7 lg:w-7" />
            </div>
            <div className="lg:mt-6">
              <div className="text-xs font-bold text-gray-5 lg:text-[13px]">STEP {i + 1}</div>
              <div className="mt-1 text-lg font-bold lg:text-xl lg:tracking-[-0.02em]">{s.title}</div>
              <div className="mt-1 text-[15px] leading-normal text-gray-5 lg:mt-2">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
