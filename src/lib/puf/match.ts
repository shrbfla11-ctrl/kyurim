import { PUF } from "./config";
import type { MatchResult, Signature } from "./types";

function centroid(s: Signature) {
  const n = s.beads.length || 1;
  return { x: s.beads.reduce((a, b) => a + b.x, 0) / n, y: s.beads.reduce((a, b) => a + b.y, 0) / n };
}

/**
 * 두 서명을 비교합니다. 무게중심을 맞춰 평행이동 차이를 보정한 뒤,
 * 위치가 허용 오차 안에서 맞는 비즈를 짝지어 비율을 구하고, 짝지어진 비즈의 감쇠율 유사도를 곱합니다.
 */
export function compareSignatures(query: Signature, enrolled: Signature): MatchResult {
  if (query.beads.length === 0 || enrolled.beads.length === 0) return { score: 0, matched: 0, decaySimilarity: null };
  const cq = centroid(query);
  const ce = centroid(enrolled);
  const dx = ce.x - cq.x;
  const dy = ce.y - cq.y;
  const tol2 = PUF.positionTolerance ** 2;
  const used = new Set<number>();
  const pairs: { q: number; e: number }[] = [];
  for (let qi = 0; qi < query.beads.length; qi++) {
    const q = query.beads[qi];
    let best = -1;
    let bestD = tol2;
    for (let ei = 0; ei < enrolled.beads.length; ei++) {
      if (used.has(ei)) continue;
      const e = enrolled.beads[ei];
      const d = (q.x + dx - e.x) ** 2 + (q.y + dy - e.y) ** 2;
      if (d < bestD) { bestD = d; best = ei; }
    }
    if (best >= 0) { used.add(best); pairs.push({ q: qi, e: best }); }
  }
  const matched = pairs.length;
  const ratio = matched / Math.max(query.beads.length, enrolled.beads.length);

  const useDecay = query.frameCount > 1 && enrolled.frameCount > 1 && matched >= 3;
  let decaySimilarity: number | null = null;
  if (useDecay) {
    let acc = 0;
    for (const p of pairs) {
      const a = query.beads[p.q].decay;
      const b = enrolled.beads[p.e].decay;
      acc += 1 - Math.abs(a - b) / Math.max(a + b, 1e-3);
    }
    decaySimilarity = Math.max(0, Math.min(1, acc / matched));
  }
  // 감쇠율이 핵심 지문이므로 위치 일치 비율에 감쇠 유사도의 제곱을 곱해 감쇠 차이를 크게 반영합니다.
  const score = useDecay ? ratio * (decaySimilarity as number) ** 2 : ratio;
  return { score: Number(score.toFixed(4)), matched, decaySimilarity: decaySimilarity === null ? null : Number(decaySimilarity.toFixed(4)) };
}

export type Candidate = { serial: string; signature: Signature };

/** 등록된 서명 전체와 비교해 가장 가까운 스티커를 고릅니다. */
export function findBestMatch(query: Signature, candidates: Candidate[]) {
  let best: { serial: string; result: MatchResult } | null = null;
  for (const c of candidates) {
    const r = compareSignatures(query, c.signature);
    if (!best || r.score > best.result.score) best = { serial: c.serial, result: r };
  }
  return best;
}
