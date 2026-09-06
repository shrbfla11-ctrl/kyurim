import {
  BookmarkIcon,
  SearchIcon,
  ShapesIcon,
  ShieldIcon,
  WarningIcon,
} from "@/components/icons";

const iconBox =
  "flex h-12 w-12 flex-none items-center justify-center rounded-[14px] lg:h-14 lg:w-14 lg:rounded-2xl";

export function Features() {
  return (
    <section id="verify" className="mx-auto w-full max-w-[1440px] px-6 pt-16 lg:px-20 lg:pt-24">
      <div className="text-[13px] font-bold text-blue lg:text-sm">주요 기능</div>
      <h2 className="mt-2 text-[28px] font-bold leading-[1.3] tracking-[-0.03em] lg:text-[32px]">
        정품 인증부터
        <br className="lg:hidden" /> 제품 정보까지
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:mt-12 lg:auto-rows-[240px] lg:grid-cols-4 lg:gap-6">
        <div className="col-span-2 flex min-h-[200px] flex-col justify-between rounded-[20px] bg-blue p-6 text-white lg:rounded-3xl lg:p-8">
          <div className={`${iconBox} bg-white/[0.18]`}>
            <SearchIcon className="lg:h-7 lg:w-7" />
          </div>
          <div>
            <div className="text-xl font-bold lg:text-2xl lg:tracking-[-0.02em]">정품 인증</div>
            <div className="mt-2 text-[15px] leading-normal text-white/85 lg:max-w-[400px] lg:text-base">
              스티커 패턴을 원본과 대조해 진위를 판별해요. 앱 설치 없이 카메라만 있으면 돼요.
            </div>
          </div>
        </div>

        <div className="flex min-h-[184px] flex-col justify-between rounded-[20px] bg-gray-1 p-6 lg:rounded-3xl lg:p-8">
          <div className={`${iconBox} bg-white text-blue`}>
            <ShapesIcon className="lg:h-7 lg:w-7" />
          </div>
          <div>
            <div className="text-[17px] font-bold lg:text-xl lg:tracking-[-0.02em]">제품 정보 확인</div>
            <div className="mt-1 text-sm leading-normal text-gray-5 lg:mt-2 lg:text-[15px]">
              제조사가 등록한 성분·제조일·사용법을 확인해요.
            </div>
          </div>
        </div>

        <div id="log" className="flex min-h-[184px] flex-col justify-between rounded-[20px] bg-gray-1 p-6 lg:rounded-3xl lg:p-8">
          <div className={`${iconBox} bg-white text-blue`}>
            <BookmarkIcon className="lg:h-7 lg:w-7" />
          </div>
          <div>
            <div className="text-[17px] font-bold lg:text-xl lg:tracking-[-0.02em]">스캔 기록</div>
            <div className="mt-1 text-sm leading-normal text-gray-5 lg:mt-2 lg:text-[15px]">
              인증한 제품을 한 곳에 모아 봐요.
            </div>
          </div>
        </div>

        <div className="col-span-2 flex items-start gap-4 rounded-[20px] border border-gray-1 bg-white p-6 lg:flex-col lg:justify-between lg:rounded-3xl lg:p-8">
          <div className={`${iconBox} bg-blue-light text-blue`}>
            <WarningIcon className="lg:h-7 lg:w-7" />
          </div>
          <div>
            <div className="text-[17px] font-bold lg:text-xl lg:tracking-[-0.02em]">위조·재사용 경고</div>
            <div className="mt-1 text-sm leading-normal text-gray-5 lg:mt-2 lg:text-[15px]">
              이미 스캔된 스티커나 패턴 불일치가 감지되면 바로 알려드려요.
            </div>
          </div>
        </div>

        <div className="col-span-2 flex items-start gap-4 rounded-[20px] border border-gray-1 bg-white p-6 lg:flex-col lg:justify-between lg:rounded-3xl lg:p-8">
          <div className={`${iconBox} bg-blue-light text-blue`}>
            <ShieldIcon className="lg:h-7 lg:w-7" />
          </div>
          <div>
            <div className="text-[17px] font-bold lg:text-xl lg:tracking-[-0.02em]">제조사용 관리 도구</div>
            <div className="mt-1 text-sm leading-normal text-gray-5 lg:mt-2 lg:text-[15px]">
              제품 등록, 스티커 발급, 스캔 현황을 관리자 페이지에서 관리해요.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
