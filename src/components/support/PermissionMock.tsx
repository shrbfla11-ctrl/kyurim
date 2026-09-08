/** 이용 가이드용 카메라 권한 안내 일러스트. 실제 스크린샷 대신 각 OS 의 권한 팝업을 단순화해 그립니다. */
export function PermissionMock({ os }: { os: "iOS" | "Android" }) {
  return os === "iOS" ? <IosMock /> : <AndroidMock />;
}

const host = "puf-kyonggi.vercel.app";

function IosMock() {
  return (
    <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-xl bg-[#1C1C1E]">
      {/* 뒤에 깔린 카메라 화면 느낌 */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,#3A4350_0%,#1C1C1E_70%)]" />
      <div className="relative w-[210px] rounded-[14px] bg-[#F2F2F7]/95 text-center text-ink shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="px-4 pb-3 pt-4">
          <div className="text-[13px] font-bold leading-snug">&quot;{host}&quot;에서 카메라에 접근하려고 합니다</div>
          <div className="mt-1 text-[11px] leading-snug text-gray-5">스티커 패턴을 촬영하기 위해 필요해요</div>
        </div>
        <div className="grid grid-cols-2 border-t border-black/10 text-[13px]">
          <span className="border-r border-black/10 py-2 text-[#007AFF]">취소</span>
          <span className="py-2 font-semibold text-[#007AFF]">허용</span>
        </div>
      </div>
    </div>
  );
}

function AndroidMock() {
  return (
    <div className="relative flex h-40 items-end justify-center overflow-hidden rounded-xl bg-[#202124]">
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_40%,#3A4350_0%,#202124_70%)]" />
      <div className="relative mb-3 w-[220px] rounded-[18px] bg-white p-4 text-ink shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-1 text-[11px]">📷</span>
          <span className="text-[12px] font-bold leading-snug">{host}에서 카메라를 사용하도록 허용하시겠어요?</span>
        </div>
        <div className="mt-3 flex justify-end gap-3 text-[12px] font-semibold text-[#1A73E8]">
          <span className="opacity-70">차단</span>
          <span className="rounded-full bg-[#1A73E8] px-3 py-1 text-white">허용</span>
        </div>
      </div>
    </div>
  );
}
