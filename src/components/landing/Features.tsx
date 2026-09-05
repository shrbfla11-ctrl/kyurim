import {
  BookmarkIcon,
  FamilyIcon,
  SearchIcon,
  ShapesIcon,
  WarningIcon,
} from "@/components/icons";

const iconBox =
  "flex h-12 w-12 flex-none items-center justify-center rounded-[14px] lg:h-14 lg:w-14 lg:rounded-2xl";

export function Features() {
  return (
    <section id="search" className="mx-auto w-full max-w-[1440px] px-6 pt-16 lg:px-20 lg:pt-24">
      <div className="text-[13px] font-bold text-blue lg:text-sm">주요 기능</div>
      <h2 className="mt-2 text-[28px] font-bold leading-[1.3] tracking-[-0.03em] lg:text-[32px]">
        알약 확인부터
        <br className="lg:hidden" /> 복약 관리까지
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:mt-12 lg:auto-rows-[240px] lg:grid-cols-4 lg:gap-6">
        <div className="col-span-2 flex min-h-[200px] flex-col justify-between rounded-[20px] bg-blue p-6 text-white lg:rounded-3xl lg:p-8">
          <div className={`${iconBox} bg-white/[0.18]`}>
            <SearchIcon className="lg:h-7 lg:w-7" />
          </div>
          <div>
            <div className="text-xl font-bold lg:text-2xl lg:tracking-[-0.02em]">식별 문자 검색</div>
            <div className="mt-2 text-[15px] leading-normal text-white/85 lg:max-w-[400px] lg:text-base">
              알약에 적힌 문자나 숫자를 입력하면 후보 알약을 바로 찾아드려요.
            </div>
          </div>
        </div>

        <div className="flex min-h-[184px] flex-col justify-between rounded-[20px] bg-gray-1 p-6 lg:rounded-3xl lg:p-8">
          <div className={`${iconBox} bg-white text-blue`}>
            <ShapesIcon className="lg:h-7 lg:w-7" />
          </div>
          <div>
            <div className="text-[17px] font-bold lg:text-xl lg:tracking-[-0.02em]">색상·모양으로 찾기</div>
            <div className="mt-1 text-sm leading-normal text-gray-5 lg:mt-2 lg:text-[15px]">
              문자가 지워진 알약도 찾을 수 있어요.
            </div>
          </div>
        </div>

        <div id="log" className="flex min-h-[184px] flex-col justify-between rounded-[20px] bg-gray-1 p-6 lg:rounded-3xl lg:p-8">
          <div className={`${iconBox} bg-white text-blue`}>
            <BookmarkIcon className="lg:h-7 lg:w-7" />
          </div>
          <div>
            <div className="text-[17px] font-bold lg:text-xl lg:tracking-[-0.02em]">복약 기록 저장</div>
            <div className="mt-1 text-sm leading-normal text-gray-5 lg:mt-2 lg:text-[15px]">
              인식한 약을 한 번에 기록해요.
            </div>
          </div>
        </div>

        <div className="col-span-2 flex items-start gap-4 rounded-[20px] border border-gray-1 bg-white p-6 lg:flex-col lg:justify-between lg:rounded-3xl lg:p-8">
          <div className={`${iconBox} bg-blue-light text-blue`}>
            <WarningIcon className="lg:h-7 lg:w-7" />
          </div>
          <div>
            <div className="text-[17px] font-bold lg:text-xl lg:tracking-[-0.02em]">약물 상호작용 알림</div>
            <div className="mt-1 text-sm leading-normal text-gray-5 lg:mt-2 lg:text-[15px]">
              함께 먹으면 안 되는 약이 있으면 미리 알려드려요.
            </div>
          </div>
        </div>

        <div className="col-span-2 flex items-start gap-4 rounded-[20px] border border-gray-1 bg-white p-6 lg:flex-col lg:justify-between lg:rounded-3xl lg:p-8">
          <div className={`${iconBox} bg-blue-light text-blue`}>
            <FamilyIcon className="lg:h-7 lg:w-7" />
          </div>
          <div>
            <div className="text-[17px] font-bold lg:text-xl lg:tracking-[-0.02em]">가족 복약 관리</div>
            <div className="mt-1 text-sm leading-normal text-gray-5 lg:mt-2 lg:text-[15px]">
              부모님과 아이의 약도 한 계정에서 관리해요.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
