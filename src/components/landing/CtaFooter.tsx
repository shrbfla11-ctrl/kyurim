import Image from "next/image";
import { Button } from "@/components/ui/Button";

export function Cta() {
  return (
    <section id="cta" className="mx-auto w-full max-w-[1440px] px-6 pt-16 lg:px-20 lg:pt-24">
      <div className="rounded-3xl bg-gradient-to-br from-blue to-blue-dark px-6 py-10 text-center text-white lg:flex lg:items-center lg:justify-between lg:gap-10 lg:p-16 lg:text-left">
        <div>
          <h2 className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em] lg:text-[32px]">
            지금 바로
            <br className="lg:hidden" /> 내 알약을 확인해 보세요
          </h2>
          <p className="mt-2 text-[15px] leading-normal text-white/85 lg:text-[17px]">
            가입 없이 카메라만 켜면 시작할 수 있어요.
          </p>
        </div>
        <Button href="/signup" variant="white" full className="mt-6 lg:mt-0 lg:w-auto lg:px-8">
          카메라로 알약 인식하기
        </Button>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-[1440px] px-6 pb-10 pt-12 lg:grid lg:grid-cols-[1fr_auto] lg:items-start lg:gap-10 lg:px-20 lg:pb-12 lg:pt-16">
      <div>
        <Image src="/puf-logo.png" alt="PUF" width={951} height={598} className="h-6 w-auto lg:h-7" />
        <p className="mt-6 hidden max-w-[560px] text-[13px] leading-relaxed text-gray-4 lg:block lg:mt-4">
          본 서비스는 참고용 정보를 제공하며 의사 또는 약사의 진단을 대체하지 않습니다.
          <br />© 2026 PUF
        </p>
      </div>
      <div className="mt-4 flex gap-4 text-sm font-semibold lg:mt-0 lg:gap-6">
        <a href="#" className="text-gray-5">이용약관</a>
        <a href="#" className="text-gray-5">개인정보처리방침</a>
      </div>
      <p className="mt-6 text-xs leading-relaxed text-gray-4 lg:hidden">
        본 서비스는 참고용 정보를 제공하며 의사 또는 약사의 진단을 대체하지 않습니다.
        <br />© 2026 PUF
      </p>
    </footer>
  );
}
