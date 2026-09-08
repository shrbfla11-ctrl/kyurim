// PUF 판별 모듈 (논문용 1차 버전). 등록(enroll) 과 대조(match) 두 접점만 외부에 노출합니다.
// 경기대 엔진이 준비되면 이 파일의 두 함수만 외부 호출로 바꾸면 됩니다.
import { PUF } from "./config";
import { extractSignature } from "./extract";
import { findBestMatch, type Candidate } from "./match";
import type { Signature } from "./types";
import type { ScanOutcome } from "@/lib/supabase/types";

export type { Signature, Candidate };

/** 등록: 프레임 묶음 → 서명 */
export async function enroll(frames: Buffer[], timestampsMs: number[]): Promise<Signature> {
  return extractSignature(frames, timestampsMs);
}

export type Verdict = { outcome: ScanOutcome; serial: string | null; score: number | null; beads: number; matched: number };

/** 대조: 프레임 묶음 + 등록 서명들 → 진짜/가짜/확인 불가 */
export async function match(frames: Buffer[], timestampsMs: number[], candidates: Candidate[]): Promise<Verdict> {
  const sig = await extractSignature(frames, timestampsMs);
  const beads = sig.beads.length;
  if (beads < PUF.minBeadsForMatch) return { outcome: "unverified", serial: null, score: null, beads, matched: 0 };
  // 감쇠 곡선이 없는 단일 프레임(갤러리 업로드)은 위치만 비교하게 되어 판정하지 않습니다.
  if (sig.frameCount < 2) return { outcome: "unverified", serial: null, score: null, beads, matched: 0 };
  const best = findBestMatch(sig, candidates);
  if (!best) return { outcome: "fake", serial: null, score: 0, beads, matched: 0 };
  const genuine = best.result.score >= PUF.genuineMin;
  return { outcome: genuine ? "genuine" : "fake", serial: genuine ? best.serial : null, score: best.result.score, beads, matched: best.result.matched };
}
