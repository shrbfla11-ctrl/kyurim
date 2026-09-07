import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Cta() {
  return (
    <section id="cta" className="mx-auto w-full max-w-[1440px] px-6 pt-16 lg:px-20 lg:pt-24">
      <div className="rounded-3xl bg-gradient-to-br from-blue to-blue-dark px-6 py-10 text-center text-white lg:flex lg:items-center lg:justify-between lg:gap-10 lg:p-16 lg:text-left">
        <div>
          <h2 className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em] lg:text-[32px]">
            지금 바로
            <br className="lg:hidden" /> 내 제품이 정품인지 확인해 보세요
          </h2>
          <p className="mt-2 text-[15px] leading-normal text-white/85 lg:text-[17px]">
            로그인하고 카메라만 켜면 바로 시작할 수 있어요.
          </p>
        </div>
        <Button href="/scan" variant="white" full className="mt-6 lg:mt-0 lg:w-auto lg:px-8">
          스티커 스캔하기
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
          인증 결과는 스티커 패턴 대조에 기반하며, 제품의 품질이나 안전성을 보증하지 않습니다.
          <br />© 2026 PUF
        </p>
      </div>
      <div className="mt-4 flex gap-4 text-sm font-semibold lg:mt-0 lg:gap-6">
        <Link href="/terms" className="text-gray-5 hover:text-ink">이용약관</Link>
        <Link href="/privacy" className="text-gray-5 hover:text-ink">개인정보처리방침</Link>
      </div>
      <p className="mt-6 text-xs leading-relaxed text-gray-4 lg:hidden">
        인증 결과는 스티커 패턴 대조에 기반하며, 제품의 품질이나 안전성을 보증하지 않습니다.
        <br />© 2026 PUF
      </p>
    </footer>
  );
}
