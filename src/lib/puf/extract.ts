import sharp from "sharp";
import { PUF } from "./config";
import type { Bead, Signature } from "./types";

type Gray = { w: number; h: number; px: Uint8Array };

async function toGray(buf: Buffer, size: number): Promise<Gray> {
  const px = await sharp(buf).resize(size, size, { fit: "fill" }).greyscale().raw().toBuffer();
  return { w: size, h: size, px: new Uint8Array(px.buffer, px.byteOffset, px.byteLength) };
}

function stats(g: Gray) {
  let sum = 0;
  for (let i = 0; i < g.px.length; i++) sum += g.px[i];
  const mean = sum / g.px.length;
  let sq = 0;
  for (let i = 0; i < g.px.length; i++) sq += (g.px[i] - mean) ** 2;
  return { mean, std: Math.sqrt(sq / g.px.length) };
}

/** 배경 추정: 비즈는 드물게 찍히므로 하위 절반 픽셀의 평균을 배경으로 봅니다. */
function background(g: Gray) {
  const sorted = Array.from(g.px).sort((a, b) => a - b);
  const half = sorted.slice(0, Math.floor(sorted.length / 2));
  return half.reduce((s, v) => s + v, 0) / Math.max(1, half.length);
}

/** 3x3 창 평균 밝기 */
function sample(g: Gray, x: number, y: number) {
  let s = 0;
  let n = 0;
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx;
      const yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= g.w || yy >= g.h) continue;
      s += g.px[yy * g.w + xx];
      n++;
    }
  return n ? s / n : 0;
}

/** 첫 프레임에서 밝은 점(비즈)의 위치를 찾습니다. 지역 최대값 + 비최대 억제. */
function detectBeads(g: Gray): { x: number; y: number; v: number }[] {
  const { mean, std } = stats(g);
  const bg = background(g);
  const threshold = Math.max(bg + PUF.minPeak, mean + 2 * std);
  const cands: { x: number; y: number; v: number }[] = [];
  for (let y = 1; y < g.h - 1; y++) {
    for (let x = 1; x < g.w - 1; x++) {
      const v = g.px[y * g.w + x];
      if (v < threshold) continue;
      let isMax = true;
      for (let dy = -1; dy <= 1 && isMax; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          if (g.px[(y + dy) * g.w + (x + dx)] > v) { isMax = false; break; }
        }
      if (isMax) cands.push({ x, y, v });
    }
  }
  cands.sort((a, b) => b.v - a.v);
  const picked: typeof cands = [];
  const r2 = 6 * 6;
  for (const c of cands) {
    if (picked.length >= PUF.maxBeads) break;
    if (picked.every((p) => (p.x - c.x) ** 2 + (p.y - c.y) ** 2 > r2)) picked.push(c);
  }
  return picked;
}

/** ln(밝기) ~ 시간 회귀 기울기 → 감쇠율(1/초) */
function fitDecay(values: number[], timesMs: number[]) {
  const pts = values.map((v, i) => ({ t: timesMs[i] / 1000, y: Math.log(Math.max(v, 1)) })).filter((p) => Number.isFinite(p.y));
  if (pts.length < 2) return 0;
  const n = pts.length;
  const mt = pts.reduce((s, p) => s + p.t, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of pts) {
    num += (p.t - mt) * (p.y - my);
    den += (p.t - mt) ** 2;
  }
  if (den === 0) return 0;
  return Math.max(0, -num / den);
}

/**
 * 프레임 묶음에서 PUF 서명을 뽑습니다.
 * 1) 첫 프레임에서 비즈 위치 검출 2) 프레임마다 각 비즈 밝기 샘플링 3) 감쇠율 회귀
 */
export async function extractSignature(frames: Buffer[], timestampsMs: number[]): Promise<Signature> {
  const size = PUF.analysisSize;
  const grays = await Promise.all(frames.map((f) => toGray(f, size)));
  const first = grays[0];
  const spots = detectBeads(first);
  const bgs = grays.map(background);
  const beads: Bead[] = spots.map((s) => {
    const curve = grays.map((g, i) => Math.max(0, sample(g, s.x, s.y) - bgs[i]));
    return {
      x: s.x / size,
      y: s.y / size,
      peak: Math.round(curve[0]),
      decay: grays.length > 1 ? Number(fitDecay(curve, timestampsMs).toFixed(4)) : 0,
    };
  });
  beads.sort((a, b) => a.y - b.y || a.x - b.x);
  return { version: 1, beads, frameCount: frames.length, durationMs: timestampsMs.length ? timestampsMs[timestampsMs.length - 1] - timestampsMs[0] : 0 };
}
