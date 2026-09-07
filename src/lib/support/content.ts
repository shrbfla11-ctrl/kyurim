// 이용 가이드 정적 콘텐츠와 고객센터 타입. FAQ·문의 데이터는 src/lib/support/data.ts 에서 DB 로 조회합니다.

export type GuideSection = {
  key: "prep" | "result" | "unverified" | "fake" | "history" | "privacy";
  title: string;
  paras: string[];
  tips?: string[];
};

export const guideSteps = [
  { n: 1, title: "로그인하기", desc: "이메일 또는 카카오·Google로 시작해요." },
  { n: 2, title: "스티커에 카메라 비추기", desc: "사각형 안에 스티커를 맞추면 자동으로 인식해요." },
  { n: 3, title: "결과 확인하기", desc: "정품 여부와 제품 정보를 바로 볼 수 있어요." },
];

export const guideSections: GuideSection[] = [
  { key: "prep", title: "스캔 준비", paras: ["촬영 버튼을 누르면 플래시가 2~3초 켜져 스티커에 빛을 먹인 뒤, 플래시가 꺼진 상태에서 자동으로 찍혀요. 주변이 밝다면 손으로 그늘을 만들어 주세요.", "스티커 전체가 사각형 안에 들어오도록 정면에서 맞춰 주세요. 처음 사용할 때 카메라 권한을 허용해야 해요."] },
  { key: "result", title: "결과 읽는 법", paras: ["스캔이 끝나면 세 가지 결과 중 하나가 표시돼요. 배지 색상만 봐도 바로 알 수 있어요."] },
  { key: "unverified", title: "확인 불가일 때", paras: ["패턴을 충분히 읽지 못했을 때 표시돼요. 스티커가 위조라는 뜻은 아니에요."], tips: ["주변이 너무 밝으면 패턴이 흐려져요. 손으로 그늘을 만들어 보세요.", "스티커에 10~15cm 정도로 가까이 대고 플래시가 꺼진 뒤 찍힐 때까지 고정하세요.", "갤러리 업로드는 플래시로 빛을 먹인 직후 어두운 곳에서 찍은 사진을 사용하세요."] },
  { key: "fake", title: "위조 의심일 때", paras: ["등록된 원본 패턴과 일치하지 않을 때 표시돼요. 제품을 사용하기 전에 판매처에 확인해 주세요."], tips: ["결과 화면의 공유 버튼으로 결과를 저장해 판매처에 보낼 수 있어요.", "제품 카드의 제조사 정보로 고객센터에 직접 문의할 수 있어요.", "스캔 기록에 저장해 두면 나중에 다시 확인할 수 있어요."] },
  { key: "history", title: "스캔 기록", paras: ["로그인 후 결과 화면에서 저장 버튼을 누르면 기록에 남아요. 기록 탭에서 제품명·제조사로 검색하고 결과별로 필터할 수 있어요."] },
  { key: "privacy", title: "개인정보", paras: ["PUF는 촬영한 이미지를 서버에 보관하지 않아요."] },
];

import type { InquiryCategory, InquiryStatus } from "@/lib/supabase/types";

export const supportCategories = ["스캔·인식", "계정·로그인", "결과·정품", "제조사 도입", "기타"] as const satisfies readonly InquiryCategory[];
export type SupportCategory = InquiryCategory;

export type Faq = { category: SupportCategory; q: string; a: string };

export type { InquiryStatus };
export type InquiryMessage = { id: string; from: "user" | "admin"; body: string; at: string; attachments: string[] };
export type InquiryUser = { name: string | null; email: string | null };
export type Inquiry = {
  id: string; ticket: string; category: SupportCategory; date: string; subject: string; preview: string;
  status: InquiryStatus; messages: InquiryMessage[];
  /** 관리자 화면에서만 채워지는 문의자 정보 */
  user?: InquiryUser;
};

export function formatInquiryDate(iso: string, withTime = false) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  const md = `${p(d.getMonth() + 1)}.${p(d.getDate())}`;
  return withTime ? `${md} ${p(d.getHours())}:${p(d.getMinutes())}` : md;
}
