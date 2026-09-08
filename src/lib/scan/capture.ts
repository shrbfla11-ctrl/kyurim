// 촬영 조건. 축광 비즈의 감쇠 곡선을 담기 위해 플래시를 끈 뒤 여러 장을 연속 촬영합니다.
export type CaptureSettings = {
  /** 플래시 조사(충전) 시간 ms */
  chargeMs: number;
  /** 플래시를 끈 뒤 촬영할 프레임 수 */
  frameCount: number;
  /** 프레임 간격 ms */
  frameIntervalMs: number;
};

export const DEFAULT_SETTINGS: CaptureSettings = { chargeMs: 2500, frameCount: 12, frameIntervalMs: 200 };
export const SETTINGS_KEY = "puf.capture.v1";

const LIMITS = { chargeMs: [500, 10000], frameCount: [1, 30], frameIntervalMs: [50, 1000] } as const;

const clamp = (v: unknown, [lo, hi]: readonly [number, number], fallback: number) => {
  const n = typeof v === "number" && Number.isFinite(v) ? v : fallback;
  return Math.min(hi, Math.max(lo, Math.round(n)));
};

export function clampSettings(input: Partial<CaptureSettings> | null | undefined): CaptureSettings {
  return {
    chargeMs: clamp(input?.chargeMs, LIMITS.chargeMs, DEFAULT_SETTINGS.chargeMs),
    frameCount: clamp(input?.frameCount, LIMITS.frameCount, DEFAULT_SETTINGS.frameCount),
    frameIntervalMs: clamp(input?.frameIntervalMs, LIMITS.frameIntervalMs, DEFAULT_SETTINGS.frameIntervalMs),
  };
}

// ---- 브라우저 저장소 연동 (useSyncExternalStore 용) ----
let cached: CaptureSettings | null = null;
const listeners = new Set<() => void>();

export function readSettings(): CaptureSettings {
  if (cached) return cached;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    cached = raw ? clampSettings(JSON.parse(raw)) : DEFAULT_SETTINGS;
  } catch {
    cached = DEFAULT_SETTINGS;
  }
  return cached;
}

export function writeSettings(next: CaptureSettings) {
  cached = next;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    /* 사생활 보호 모드 등 */
  }
  listeners.forEach((l) => l());
}

export function subscribeSettings(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
