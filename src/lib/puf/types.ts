// PUF 서명: 플래시를 끈 뒤 각 비즈의 밝기가 줄어드는 속도(감쇠율)와 위치의 조합입니다.
// 스티커마다 비즈 배치와 감쇠율이 달라 "지문" 역할을 합니다.

export type Bead = {
  /** 프레임 한 변을 1 로 본 정규화 좌표 */
  x: number;
  y: number;
  /** 배경을 뺀 첫 프레임 밝기 (0~255) */
  peak: number;
  /** 감쇠율 (1/초). ln(밝기) 를 시간에 대해 회귀한 기울기의 부호 반전 값. 프레임이 1장이면 0 */
  decay: number;
};

export type Signature = {
  version: 1;
  beads: Bead[];
  frameCount: number;
  /** 첫 프레임부터 마지막 프레임까지 ms */
  durationMs: number;
};

export type MatchResult = {
  /** 0~1. 위치 일치 비율과 감쇠율 유사도를 합친 값 */
  score: number;
  /** 위치가 맞은 비즈 수 */
  matched: number;
  /** 감쇠율 유사도 (0~1). 프레임이 1장이면 null */
  decaySimilarity: number | null;
};
