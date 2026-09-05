import { ShieldIcon } from "@/components/icons";

const stats = [
  { value: "2.4만+", label: "등록 알약" },
  { value: "98.2%", label: "인식 정확도" },
  { value: "120만+", label: "누적 사용자" },
];

export function Trust() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-6 pt-16 lg:px-20 lg:pt-24">
      <div className="rounded-3xl bg-gray-1 px-6 py-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-16 lg:py-14">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-white text-blue lg:h-14 lg:w-14 lg:rounded-2xl">
            <ShieldIcon className="lg:h-7 lg:w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold leading-[1.3] tracking-[-0.03em] lg:mt-6 lg:text-[32px]">
            식품의약품안전처
            <br />
            공공데이터를 기반으로 해요
          </h2>
          <p className="mt-2 text-[15px] leading-normal text-gray-5 lg:mt-4 lg:max-w-[480px] lg:text-base">
            의약품 식별 정보는 식약처 공개 데이터를 매일 갱신해 제공하며, 촬영한 사진은 서버에 저장하지 않아요.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-ink/[0.08] pt-6 lg:mt-0 lg:gap-6 lg:border-0 lg:pt-0">
          {stats.map((s) => (
            <div key={s.label} className="lg:rounded-[20px] lg:bg-white lg:p-6">
              <div className="text-[22px] font-bold tracking-[-0.03em] lg:text-[28px]">{s.value}</div>
              <div className="mt-1 text-xs text-gray-5 lg:mt-2 lg:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
