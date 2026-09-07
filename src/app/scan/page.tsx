import type { Metadata } from "next";
import { ImagePlus, ShieldCheck } from "lucide-react";
import { Nav } from "@/components/landing/Nav";
import { TabBar } from "@/components/app/TabBar";
import { ScanView } from "@/components/scan/ScanView";
import { getUserSummary } from "@/lib/auth/user";

export const metadata: Metadata = { title: "정품 확인 - PUF" };

const tips = [
  { title: "밝은 곳에서 촬영하세요", desc: "그림자나 반사광이 패턴을 가리지 않게 해 주세요." },
  { title: "스티커를 정면으로", desc: "사각형 안에 스티커 전체가 들어오도록 맞춰 주세요." },
  { title: "잠시 고정하세요", desc: "패턴 대조에 1~2초가 걸려요." },
];

export default async function ScanPage() {
  const user = await getUserSummary();
  return (
    <>
      <div className="hidden lg:block">
        <Nav user={user} active="verify" />
      </div>

      {/* 모바일: 전체 화면 카메라 / 데스크톱: 카드형 카메라 + 촬영 팁 */}
      <main className="lg:bg-gray-1 lg:px-20 lg:py-12">
        <div className="lg:mx-auto lg:grid lg:max-w-[1280px] lg:grid-cols-[1fr_400px] lg:gap-12">
          <div className="h-[calc(100dvh-84px)] lg:h-[720px] lg:overflow-hidden lg:rounded-3xl lg:shadow-card">
            <ScanView frameClass="w-[240px] lg:w-[320px]" />
          </div>

          <aside className="hidden flex-col gap-4 lg:flex">
            <div className="rounded-[20px] bg-white p-6 shadow-card">
              <div className="text-[13px] font-bold text-blue">촬영 팁</div>
              <div className="mt-4 flex flex-col gap-4">
                {tips.map((t, i) => (
                  <div key={t.title} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-blue-light font-inter text-sm font-bold text-blue">{i + 1}</span>
                    <div>
                      <div className="text-base font-bold">{t.title}</div>
                      <div className="mt-1 text-sm leading-normal text-gray-5">{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[20px] bg-white p-6 shadow-card">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-green-light text-green">
                <ShieldCheck size={20} />
              </span>
              <div>
                <div className="text-base font-bold">이미지는 저장되지 않아요</div>
                <div className="mt-1 text-sm leading-normal text-gray-5">촬영 이미지는 패턴 대조 직후 삭제되며 서버에 남지 않아요.</div>
              </div>
            </div>
            <div className="mt-auto flex items-center gap-2 rounded-[14px] bg-blue-light px-4 py-3 text-[15px] font-bold text-blue">
              <ImagePlus size={18} />
              갤러리 업로드는 카메라 화면의 오른쪽 버튼을 이용하세요
            </div>
          </aside>
        </div>
      </main>

      <TabBar active="scan" dark />
    </>
  );
}
