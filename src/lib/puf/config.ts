// 판정 기준. 환경 변수로 바꿀 수 있어 엔진 조정에 맞춰 재배포 없이 조절합니다.
const num = (key: string, fallback: number) => {
  const v = Number(process.env[key]);
  return Number.isFinite(v) ? v : fallback;
};

export const PUF = {
  /** 분석용 축소 해상도(px). 비즈 검출과 밝기 샘플링은 이 크기에서 합니다. */
  analysisSize: 256,
  /** 검출할 최대 비즈 수 */
  maxBeads: 96,
  /** 비즈로 인정할 최소 밝기(배경 대비) */
  minPeak: 18,
  /** 판독 가능으로 보는 최소 비즈 수. 이보다 적으면 "확인 불가" */
  minBeadsForMatch: num("PUF_MIN_BEADS", 6),
  /** 같은 비즈로 볼 위치 허용 오차 (정규화 좌표) */
  positionTolerance: num("PUF_POS_TOL", 0.035),
  /** 정품으로 판정할 최소 점수 */
  genuineMin: num("PUF_GENUINE_MIN", 0.6),
} as const;
