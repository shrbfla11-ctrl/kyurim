// 관리자 화면 예시 데이터. DB 연결 후 실제 조회로 대체합니다.
import type { ScanOutcome } from "@/lib/scan/mock";

export const categories = ["스킨케어", "전자기기", "건강식품", "패션잡화"] as const;
export type Category = (typeof categories)[number];

export type Product = { id: string; name: string; maker: string; category: Category; stickers: number; createdAt: string };

export const products: Product[] = [
  { id: "p1", name: "글로우 리페어 세럼 50ml", maker: "루미에르 코스메틱", category: "스킨케어", stickers: 12000, createdAt: "2026.06.12" },
  { id: "p2", name: "하이드라 선크림 SPF50+", maker: "루미에르 코스메틱", category: "스킨케어", stickers: 8400, createdAt: "2026.06.12" },
  { id: "p3", name: "에어핏 무선 이어버드", maker: "소닉웨이브", category: "전자기기", stickers: 15000, createdAt: "2026.05.28" },
  { id: "p4", name: "프리미엄 오메가3 90캡슐", maker: "헬씨라이프", category: "건강식품", stickers: 6000, createdAt: "2026.05.03" },
  { id: "p5", name: "시그니처 레더 카드지갑", maker: "메종 도레", category: "패션잡화", stickers: 3200, createdAt: "2026.04.19" },
  { id: "p6", name: "그래핀 보조배터리 10000", maker: "볼트랩", category: "전자기기", stickers: 3600, createdAt: "2026.03.30" },
];

export type ScanLog = { time: string; product: string; stickerId: string; outcome: ScanOutcome; count: number; region: string };

export const scanLogs: ScanLog[] = [
  { time: "09.07 14:32:08", product: "글로우 리페어 세럼 50ml", stickerId: "PUF-LM24-000118", outcome: "genuine", count: 1, region: "서울 강남" },
  { time: "09.07 14:31:44", product: "하이드라 선크림 SPF50+", stickerId: "PUF-LM24-004402", outcome: "genuine", count: 2, region: "부산 해운대" },
  { time: "09.07 14:30:12", product: "시그니처 레더 카드지갑", stickerId: "PUF-MD23-000077", outcome: "fake", count: 27, region: "인천 부평" },
  { time: "09.07 14:28:57", product: "에어핏 무선 이어버드", stickerId: "PUF-SW24-009310", outcome: "genuine", count: 1, region: "대구 수성" },
  { time: "09.07 14:27:30", product: "프리미엄 오메가3 90캡슐", stickerId: "PUF-HL24-001205", outcome: "unverified", count: 3, region: "경기 성남" },
  { time: "09.07 14:25:03", product: "글로우 리페어 세럼 50ml", stickerId: "PUF-LM24-000097", outcome: "genuine", count: 1, region: "서울 마포" },
  { time: "09.07 14:21:19", product: "그래핀 보조배터리 10000", stickerId: "PUF-VL24-000512", outcome: "genuine", count: 1, region: "광주 서구" },
  { time: "09.07 14:18:46", product: "시그니처 레더 카드지갑", stickerId: "PUF-MD23-000077", outcome: "fake", count: 26, region: "인천 부평" },
  { time: "09.07 14:15:02", product: "하이드라 선크림 SPF50+", stickerId: "PUF-LM24-003991", outcome: "unverified", count: 1, region: "대전 유성" },
  { time: "09.07 14:12:37", product: "에어핏 무선 이어버드", stickerId: "PUF-SW24-008874", outcome: "genuine", count: 1, region: "서울 송파" },
];

export type StickerStatus = "done" | "processing" | "failed";
export type Sticker = { id: string; product: string; issuedAt: string; status: StickerStatus };

export const stickers: Sticker[] = Array.from({ length: 8 }, (_, i) => ({
  id: `PUF-LM24-${String(312 - i).padStart(6, "0")}`,
  product: "글로우 리페어 세럼 50ml",
  issuedAt: "2026.09.07",
  status: i === 0 ? "processing" : i === 2 ? "failed" : "done",
}));

export const dashboardStats = {
  scansToday: 1284,
  scansDelta: "▲ 12.4% 어제 대비",
  genuineRate: 97.6,
  genuineNote: "최근 7일 평균 97.1%",
  suspected: 7,
  suspectedDelta: "▲ 3건 어제 대비",
  stickersIssued: 48200,
  stickersNote: "이번 달 +6,000",
};
