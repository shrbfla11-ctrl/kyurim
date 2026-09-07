// 패턴 매칭 엔진이 연결되기 전까지 쓰는 예시 데이터입니다.
// 엔진·DB 가 준비되면 이 파일의 내용은 실제 조회 결과로 대체됩니다.

export type ScanOutcome = "genuine" | "unverified" | "fake";

export type ScanTag = { label: string; tone: "green" | "blue" | "gray" | "amber" | "red" };

export type ScanResult = {
  outcome: ScanOutcome;
  scannedAt: string;
  firstScanAt: string;
  count: number;
  product: {
    category: string;
    name: string;
    maker: string;
    lot: string;
    info: { title: string; body: string }[];
  };
  tags: ScanTag[];
};

const product: ScanResult["product"] = {
  category: "스킨케어 · 세럼",
  name: "글로우 리페어 세럼 50ml",
  maker: "루미에르 코스메틱",
  lot: "LM24-0913",
  info: [
    { title: "제품 설명", body: "히알루론산과 나이아신아마이드를 담은 데일리 리페어 세럼이에요. 건조하고 거칠어진 피부 결을 정돈해 줍니다. (제조사 제공 정보)" },
    { title: "전성분", body: "정제수, 글리세린, 나이아신아마이드, 부틸렌글라이콜, 소듐하이알루로네이트, 판테놀, 알란토인, 1,2-헥산다이올" },
    { title: "사용 방법", body: "세안 후 토너로 피부를 정돈한 뒤, 적당량을 얼굴 전체에 고르게 펴 바르고 가볍게 두드려 흡수시켜 주세요." },
  ],
};

export function isScanOutcome(v: unknown): v is ScanOutcome {
  return v === "genuine" || v === "unverified" || v === "fake";
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function mockResult(outcome: ScanOutcome, scannedAt = new Date().toISOString()): ScanResult {
  switch (outcome) {
    case "unverified":
      return {
        outcome, scannedAt, product, count: 3, firstScanAt: "2026-08-21T09:14:00+09:00",
        tags: [{ label: "재스캔 필요", tone: "amber" }, { label: "유통 정상", tone: "gray" }],
      };
    case "fake":
      return {
        outcome, scannedAt, product, count: 27, firstScanAt: "2026-05-02T18:47:00+09:00",
        tags: [{ label: "패턴 불일치", tone: "red" }, { label: "스캔 27회", tone: "amber" }],
      };
    default:
      return {
        outcome, scannedAt, product, count: 1, firstScanAt: scannedAt,
        tags: [{ label: "정품 인증", tone: "green" }, { label: "첫 스캔", tone: "blue" }, { label: "유통 정상", tone: "gray" }],
      };
  }
}

export type HistoryItem = { id: string; name: string; maker: string; time: string; outcome: ScanOutcome };

export const mockHistory: HistoryItem[] = [
  { id: "h1", name: "글로우 리페어 세럼 50ml", maker: "루미에르 코스메틱", time: "오늘 14:32", outcome: "genuine" },
  { id: "h2", name: "에어핏 무선 이어버드", maker: "소닉웨이브", time: "오늘 09:10", outcome: "genuine" },
  { id: "h3", name: "프리미엄 오메가3 90캡슐", maker: "헬씨라이프", time: "어제 21:04", outcome: "unverified" },
  { id: "h4", name: "시그니처 레더 카드지갑", maker: "메종 도레", time: "09.03 16:48", outcome: "fake" },
  { id: "h5", name: "하이드라 선크림 SPF50+", maker: "루미에르 코스메틱", time: "08.28 11:20", outcome: "genuine" },
  { id: "h6", name: "그래핀 보조배터리 10000", maker: "볼트랩", time: "08.21 09:14", outcome: "genuine" },
];

export const outcomeMeta: Record<ScanOutcome, { badge: string; headline: string; desc: string }> = {
  genuine: { badge: "정품 확인", headline: "정품이에요", desc: "등록된 원본 패턴과 일치해요. 안심하고 사용하세요." },
  unverified: { badge: "확인 불가", headline: "판별할 수 없어요", desc: "패턴을 충분히 읽지 못했어요. 밝은 곳에서 다시 스캔해 주세요." },
  fake: { badge: "위조 의심", headline: "위조가 의심돼요", desc: "등록된 원본 패턴과 일치하지 않아요. 구매처에 문의해 주세요." },
};
