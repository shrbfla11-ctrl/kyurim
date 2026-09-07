// 이용 가이드 · 고객센터 콘텐츠와 예시 문의 데이터. 문의는 DB 연결 후 실제 저장으로 대체합니다.

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
  { key: "prep", title: "스캔 준비", paras: ["밝은 곳에서 촬영하세요. 카메라가 켜지면 플래시가 자동으로 켜져요.", "스티커 전체가 사각형 안에 들어오도록 정면에서 맞춰 주세요. 처음 사용할 때 카메라 권한을 허용해야 해요."] },
  { key: "result", title: "결과 읽는 법", paras: ["스캔이 끝나면 세 가지 결과 중 하나가 표시돼요. 배지 색상만 봐도 바로 알 수 있어요."] },
  { key: "unverified", title: "확인 불가일 때", paras: ["패턴을 충분히 읽지 못했을 때 표시돼요. 스티커가 위조라는 뜻은 아니에요."], tips: ["그림자나 반사광이 스티커를 가리지 않게 각도를 바꿔 보세요.", "스티커에 10~15cm 정도로 가까이 대고 1~2초 고정하세요.", "카메라 하단의 갤러리 버튼으로 미리 찍어둔 사진을 업로드할 수도 있어요."] },
  { key: "fake", title: "위조 의심일 때", paras: ["등록된 원본 패턴과 일치하지 않을 때 표시돼요. 제품을 사용하기 전에 판매처에 확인해 주세요."], tips: ["결과 화면의 공유 버튼으로 결과를 저장해 판매처에 보낼 수 있어요.", "제품 카드의 제조사 정보로 고객센터에 직접 문의할 수 있어요.", "스캔 기록에 저장해 두면 나중에 다시 확인할 수 있어요."] },
  { key: "history", title: "스캔 기록", paras: ["로그인 후 결과 화면에서 저장 버튼을 누르면 기록에 남아요. 기록 탭에서 제품명·제조사로 검색하고 결과별로 필터할 수 있어요."] },
  { key: "privacy", title: "개인정보", paras: ["PUF는 촬영한 이미지를 서버에 보관하지 않아요."] },
];

export const supportCategories = ["스캔·인식", "계정·로그인", "결과·정품", "제조사 도입", "기타"] as const;
export type SupportCategory = (typeof supportCategories)[number];

export type Faq = { category: SupportCategory; q: string; a: string };

export const faqs: Faq[] = [
  { category: "스캔·인식", q: "스티커가 인식되지 않아요", a: "밝은 곳에서 스티커 전체가 사각형 안에 들어오도록 정면에서 맞춰 주세요. 반사광이 심하면 각도를 살짝 바꾸고, 10~15cm 거리에서 1~2초 고정하면 인식률이 높아져요." },
  { category: "스캔·인식", q: "플래시가 켜지지 않아요", a: "플래시는 카메라가 켜질 때 자동으로 켜져요. 일부 구형 기기나 브라우저는 플래시 제어를 지원하지 않아 밝은 곳에서 촬영하셔야 해요." },
  { category: "스캔·인식", q: "카메라 권한을 허용했는데 화면이 검게 나와요", a: "다른 앱이 카메라를 사용 중이면 화면이 표시되지 않을 수 있어요. 카메라를 사용하는 다른 앱을 종료한 뒤 페이지를 새로 고침해 주세요." },
  { category: "계정·로그인", q: "소셜 로그인이 안 돼요", a: "카카오·Google 로그인 팝업이 차단되어 있는지 확인해 주세요. 같은 이메일로 가입된 계정이 있으면 자동으로 하나의 계정으로 연결돼요." },
  { category: "계정·로그인", q: "비밀번호를 잊었어요", a: "로그인 화면의 \"비밀번호 찾기\"에서 가입한 이메일을 입력하면 재설정 링크를 보내드려요. 링크는 10분 동안 유효해요." },
  { category: "결과·정품", q: "위조 의심이 나왔어요", a: "등록된 원본 패턴과 일치하지 않을 때 표시돼요. 결과 화면을 공유 버튼으로 저장해 구매처 또는 제조사 고객센터에 문의해 주세요. 제품을 사용하기 전에 확인하시길 권해요." },
  { category: "결과·정품", q: "정품인데 스캔 횟수 경고가 떠요", a: "같은 스티커가 여러 번 스캔되면 표시돼요. 매장 시연이나 가족이 함께 확인한 경우처럼 정상적인 상황일 수도 있지만, 중고 거래 제품이라면 판매자에게 확인해 보세요." },
  { category: "결과·정품", q: "스캔 기록이 사라졌어요", a: "스캔 기록은 로그인한 계정에 저장돼요. 다른 계정으로 로그인했는지 확인해 주세요." },
  { category: "제조사 도입", q: "제조사인데 도입하고 싶어요", a: "제품 등록부터 스티커 발급, 스캔 모니터링까지 관리자 콘솔에서 이용할 수 있어요. 1:1 문의에서 \"제조사 도입\"을 선택해 회사명과 제품군을 남겨 주시면 담당자가 연락드려요." },
  { category: "기타", q: "촬영한 사진은 어디에 저장되나요?", a: "어디에도 저장되지 않아요. 이미지는 패턴 대조 직후 즉시 삭제되며 서버에 남지 않아요. 스캔 기록에는 결과 정보만 저장돼요." },
];

export type InquiryStatus = "wait" | "done";
export type InquiryMessage = { from: "user" | "admin"; body: string; at: string; attachment?: "fake" };
export type Inquiry = { id: string; ticket: string; category: SupportCategory; date: string; subject: string; preview: string; status: InquiryStatus; messages: InquiryMessage[] };

export const mockInquiries: Inquiry[] = [
  {
    id: "i1", ticket: "#PUF-260905-0117", category: "결과·정품", date: "09.05", status: "done",
    subject: "위조 의심 결과가 나왔는데 정품 매장에서 구매했어요",
    preview: "백화점 정품 매장에서 구매한 글로우 리페어 세럼을 스캔했는데 위조 의심 결과가 나왔어요.",
    messages: [
      { from: "user", at: "09.05 16:42", attachment: "fake", body: "백화점 정품 매장에서 구매한 글로우 리페어 세럼을 스캔했는데 위조 의심 결과가 나왔어요. 스티커가 살짝 긁혀 있긴 한데, 이 경우 어떻게 해야 하나요? 스캔 횟수는 1회로 표시됐어요." },
      { from: "admin", at: "09.06 10:18", body: "안녕하세요. 불편을 드려 죄송해요.\n\n보내주신 스크린샷을 확인했어요. 스티커 표면이 긁히면 미세 패턴 일부가 손상되어 원본과 대조가 어려울 수 있어요. 이 경우 실제 위조가 아니더라도 '위조 의심'으로 표시될 수 있습니다.\n\n구매 영수증과 함께 제조사 고객센터에 문의하시면 제조사에서 직접 정품 여부를 확인해 드려요. 추가로 궁금한 점이 있으면 이 문의에 답글로 남겨 주세요." },
    ],
  },
  {
    id: "i2", ticket: "#PUF-260902-0088", category: "스캔·인식", date: "09.02", status: "wait",
    subject: "플래시가 자동으로 켜지지 않아요",
    preview: "어두운 곳에서 스캔하면 플래시가 켜진다고 했는데 계속 꺼져 있어요. 아이폰 사파리 사용 중입니다.",
    messages: [{ from: "user", at: "09.02 21:10", body: "어두운 곳에서 스캔하면 플래시가 켜진다고 했는데 계속 꺼져 있어요. 아이폰 사파리 사용 중입니다." }],
  },
  {
    id: "i3", ticket: "#PUF-260821-0031", category: "계정·로그인", date: "08.21", status: "done",
    subject: "Google 계정 연결이 안 돼요",
    preview: "이메일로 가입한 뒤 프로필에서 Google 연결을 누르면 오류가 나요.",
    messages: [
      { from: "user", at: "08.21 09:14", body: "이메일로 가입한 뒤 프로필에서 Google 연결을 누르면 오류가 나요." },
      { from: "admin", at: "08.21 14:02", body: "안녕하세요. 같은 이메일의 Google 계정으로 로그인하시면 기존 계정과 자동으로 연결돼요. 로그인 화면에서 \"Google로 계속하기\"를 눌러 시도해 주세요." },
    ],
  },
];
