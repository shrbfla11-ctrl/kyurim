"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CircleHelp, Image as ImageIcon, ShieldCheck, SlidersHorizontal, TriangleAlert, X, Zap, ZapOff } from "lucide-react";
import { DEFAULT_SETTINGS, clampSettings, readSettings, subscribeSettings, writeSettings, type CaptureSettings } from "@/lib/scan/capture";

type ScanState = "idle" | "charging" | "capturing" | "scanning" | "error";

/** 연속 캡처 프레임 한 변 크기(px). 프레임 수가 많아 1024 보다 작게 둡니다. */
const FRAME_PX = 800;

const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

const roundBtn =
  "flex items-center justify-center rounded-full border-0 bg-white/12 text-white transition duration-300 hover:bg-white/22 disabled:opacity-50";

/**
 * 카메라 스캔 화면. 스티커의 축광 비즈는 플래시로 빛을 먹인 뒤 플래시를 끄고 찍어야 패턴이 보입니다.
 * 촬영 버튼 한 번으로 [플래시 ON 충전 → 플래시 OFF → 자동 촬영 → /api/scan] 순서가 진행됩니다.
 * 카메라를 쓸 수 없는 환경에서는 디자인의 어두운 배경 위에 갤러리 업로드만 제공합니다.
 */
export function ScanView({ frameClass = "w-[240px]", isAdmin = false, initialEnrollSerial = "" }: { frameClass?: string; isAdmin?: boolean; initialEnrollSerial?: string }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<ScanState>("idle");
  const [hasCamera, setHasCamera] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<{ title: string; desc: string } | null>(null);
  // 촬영 조건은 기기에 기억합니다(논문 실험용으로 조절 가능). 서버 렌더 시에는 기본값을 쓰고 클라이언트에서 저장값으로 바뀝니다.
  const settings = useSyncExternalStore(subscribeSettings, readSettings, () => DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  // 등록 모드(관리자): 촬영 결과를 대조하지 않고 지정한 시리얼의 서명으로 저장합니다.
  const [enrollSerial, setEnrollSerial] = useState(initialEnrollSerial.toUpperCase());
  const [enrollMode, setEnrollMode] = useState(isAdmin && initialEnrollSerial.length > 0);
  const [enrolled, setEnrolled] = useState<{ serial: string; beads: number } | null>(null);
  function updateSettings(patch: Partial<CaptureSettings>) {
    writeSettings(clampSettings({ ...settings, ...patch }));
  }

  // 카메라 열기
  useEffect(() => {
    let cancelled = false;
    async function open() {
      if (!navigator.mediaDevices?.getUserMedia) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setHasCamera(true);
        // 플래시는 촬영 시퀀스에서만 잠깐 켭니다. 여기서는 지원 여부만 확인합니다.
        const track = stream.getVideoTracks()[0];
        const caps = track?.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined;
        setTorchSupported(!!caps?.torch);
      } catch {
        setHasCamera(false);
      }
    }
    open();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const setTorch = useCallback(async (on: boolean) => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return false;
    try {
      await track.applyConstraints({ advanced: [{ torch: on } as MediaTrackConstraintSet] });
      setTorchOn(on);
      return true;
    } catch {
      return false;
    }
  }, []);

  const showError = useCallback((title: string, desc: string) => {
    setErrorMsg({ title, desc });
    setState("error");
    window.setTimeout(() => {
      setState((s) => (s === "error" ? "idle" : s));
      setErrorMsg(null);
    }, 3200);
  }, []);

  /** 프레임 묶음(연속 캡처) 또는 단일 이미지(갤러리)를 서버로 보냅니다. 등록 모드면 대조 대신 서명을 저장합니다. */
  const analyze = useCallback(
    async (frames: Blob[], timestamps: number[], used: CaptureSettings | null) => {
      setState("scanning");
      const form = new FormData();
      frames.forEach((b, i) => form.append("frames", b, `frame-${i}.jpg`));
      form.append("timestamps", JSON.stringify(timestamps));
      if (used) {
        form.append("chargeMs", String(used.chargeMs));
        form.append("frameCount", String(used.frameCount));
        form.append("frameIntervalMs", String(used.frameIntervalMs));
      }
      if (enrollMode) {
        form.append("serial", enrollSerial);
        const res = await fetch("/api/puf/enroll", { method: "POST", body: form });
        const data = (await res.json().catch(() => ({}))) as { error?: string; beads?: number; serial?: string };
        if (!res.ok) return showError("등록에 실패했어요", data.error ?? "다시 시도해 주세요.");
        setEnrolled({ serial: data.serial ?? enrollSerial, beads: data.beads ?? 0 });
        setState("idle");
        return;
      }
      try {
        const res = await fetch("/api/scan", { method: "POST", body: form });
        if (!res.ok) throw new Error("bad response");
        const data = (await res.json()) as { id: string };
        streamRef.current?.getTracks().forEach((t) => t.stop());
        router.push(`/scan/result?id=${encodeURIComponent(data.id)}`);
      } catch {
        showError("분석에 실패했어요", "네트워크 상태를 확인하고 다시 시도해 주세요.");
      }
    },
    [router, showError, enrollMode, enrollSerial],
  );

  async function capture() {
    if (state !== "idle") return;
    if (enrollMode && !enrollSerial.trim()) return showError("시리얼이 없어요", "등록할 스티커 시리얼을 입력해 주세요.");
    setEnrolled(null);
    const video = videoRef.current;
    if (!hasCamera || !video || video.videoWidth === 0) {
      showError("카메라를 사용할 수 없어요", "카메라 권한을 허용하거나 갤러리에서 이미지를 선택해 주세요.");
      return;
    }
    setSettingsOpen(false);
    const used = settings;
    // 1) 플래시로 비즈에 빛을 먹이고 2) 플래시를 끈 직후부터 3) 일정 간격으로 여러 장을 찍어 감쇠 곡선을 담습니다.
    if (torchSupported) {
      setState("charging");
      const lit = await setTorch(true);
      if (lit) await sleep(used.chargeMs);
      await setTorch(false);
    }
    setState("capturing");
    // 가이드 프레임(중앙 정사각형) 영역만 잘라서 보냅니다.
    const side = Math.min(video.videoWidth, video.videoHeight) * 0.7;
    const sx = (video.videoWidth - side) / 2;
    const sy = (video.videoHeight - side) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = FRAME_PX;
    canvas.height = FRAME_PX;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const frames: Blob[] = [];
    const timestamps: number[] = [];
    const t0 = performance.now();
    for (let i = 0; i < used.frameCount; i++) {
      const target = t0 + i * used.frameIntervalMs;
      const wait = target - performance.now();
      if (wait > 0) await sleep(wait);
      ctx.drawImage(video, sx, sy, side, side, 0, 0, FRAME_PX, FRAME_PX);
      timestamps.push(Math.round(performance.now() - t0));
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
      if (blob) frames.push(blob);
      setProgress({ done: i + 1, total: used.frameCount });
    }
    setProgress(null);
    if (frames.length === 0) return showError("초점이 맞지 않아요", "스티커에 가까이 대고 흔들리지 않게 다시 촬영해 주세요.");
    analyze(frames, timestamps, used);
  }

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) analyze([file], [0], null);
  }

  const charging = state === "charging";
  const busy = state !== "idle" && state !== "error";
  const scanning = state === "scanning";
  const isError = state === "error";
  const centerText = charging
    ? "빛을 충전하고 있어요…"
    : state === "capturing"
      ? progress ? `촬영 중 ${progress.done} / ${progress.total}` : "촬영 중이에요"
      : scanning
        ? enrollMode ? "패턴을 등록하고 있어요…" : "패턴을 대조하고 있어요…"
        : "스티커를 사각형 안에 맞춰 주세요";
  const frameColor = isError ? "border-red" : "border-blue";
  const corner = `absolute h-9 w-9 ${frameColor} transition-colors duration-300`;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[radial-gradient(80%_60%_at_50%_40%,#3A4350_0%,#232A33_60%,#191F28_100%)] text-white">
      {/* 카메라 프리뷰 */}
      <video ref={videoRef} playsInline muted className={`absolute inset-0 h-full w-full object-cover ${hasCamera ? "opacity-100" : "opacity-0"}`} />
      {hasCamera && <div className="absolute inset-0 bg-black/25" />}

      {/* 상단 */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4">
        <button type="button" aria-label="닫기" onClick={() => router.push("/")} className={`${roundBtn} h-11 w-11`}>
          <X size={22} />
        </button>
        <span className="text-[15px] font-semibold">정품 확인</span>
        <span className="flex gap-2">
          <button type="button" aria-label="촬영 조건" aria-expanded={settingsOpen} onClick={() => setSettingsOpen((v) => !v)} disabled={busy} className={`${roundBtn} h-11 w-11 ${settingsOpen ? "bg-white/30" : ""}`}>
            <SlidersHorizontal size={22} />
          </button>
          <Link href="/guide" aria-label="도움말" className={`${roundBtn} h-11 w-11`}>
            <CircleHelp size={22} />
          </Link>
        </span>
      </div>

      {/* 등록 모드 배너 (관리자) */}
      {isAdmin && (
        <div className="relative z-10 mx-4 mt-3 flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 backdrop-blur">
          <button
            type="button"
            role="switch"
            aria-checked={enrollMode}
            onClick={() => { setEnrollMode((v) => !v); setEnrolled(null); }}
            disabled={busy}
            className={`flex h-8 flex-none items-center rounded-full px-3 text-xs font-bold transition-colors duration-300 ${enrollMode ? "bg-amber text-ink" : "bg-white/15 text-white"}`}
          >
            {enrollMode ? "등록 모드" : "대조 모드"}
          </button>
          {enrollMode && (
            <input
              value={enrollSerial}
              onChange={(e) => setEnrollSerial(e.target.value.toUpperCase())}
              placeholder="스티커 시리얼 (PUF-LM26-000001)"
              spellCheck={false}
              className="h-8 min-w-0 flex-1 rounded-lg bg-white/90 px-2.5 font-inter text-[13px] font-semibold text-ink outline-none"
            />
          )}
        </div>
      )}
      {enrolled && (
        <div className="absolute inset-x-4 top-[128px] z-20 flex animate-toast items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-ink shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-green-light text-green"><ShieldCheck size={20} strokeWidth={2.5} /></span>
          <span className="flex-1">
            <span className="block text-[15px] font-bold">등록했어요 · <span className="font-inter">{enrolled.serial}</span></span>
            <span className="mt-0.5 block text-[13px] text-gray-5">비즈 {enrolled.beads}개의 감쇠 패턴을 저장했어요. 다음 시리얼을 입력하고 계속 등록할 수 있어요.</span>
          </span>
          <button type="button" aria-label="닫기" onClick={() => setEnrolled(null)} className="text-gray-4 hover:text-ink hover:brightness-100"><X size={18} /></button>
        </div>
      )}

      {/* 촬영 조건 패널 (논문 실험용: 조사 시간 · 프레임 수 · 간격) */}
      {settingsOpen && (
        <div className="absolute inset-x-4 top-[76px] z-20 flex flex-col gap-4 rounded-2xl bg-white p-5 text-ink shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold">촬영 조건</span>
            <button type="button" onClick={() => updateSettings(DEFAULT_SETTINGS)} className="text-[13px] font-semibold text-gray-5 hover:text-ink hover:brightness-100">기본값</button>
          </div>
          <SettingRow label="플래시 조사 시간" value={`${(settings.chargeMs / 1000).toFixed(1)}초`} min={500} max={10000} step={100} current={settings.chargeMs} onChange={(v) => updateSettings({ chargeMs: v })} />
          <SettingRow label="촬영 프레임 수" value={`${settings.frameCount}장`} min={1} max={30} step={1} current={settings.frameCount} onChange={(v) => updateSettings({ frameCount: v })} />
          <SettingRow label="프레임 간격" value={`${settings.frameIntervalMs}ms`} min={50} max={1000} step={50} current={settings.frameIntervalMs} onChange={(v) => updateSettings({ frameIntervalMs: v })} />
          <div className="text-xs text-gray-4">
            플래시를 끈 뒤 총 <span className="font-inter font-semibold text-gray-6">{((settings.frameCount - 1) * settings.frameIntervalMs / 1000).toFixed(1)}초</span> 동안 촬영해요. 설정은 이 기기에 저장돼요.
          </div>
        </div>
      )}

      {/* 오류 토스트 */}
      {isError && errorMsg && (
        <div className="absolute inset-x-4 top-[76px] z-20 flex animate-toast items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-ink shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-red-light text-red">
            <TriangleAlert size={20} strokeWidth={2.5} />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-bold">{errorMsg.title}</span>
            <span className="mt-0.5 block text-[13px] text-gray-5">{errorMsg.desc}</span>
          </span>
        </div>
      )}

      {/* 중앙 */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <div className="flex items-center gap-2 text-base font-semibold text-white/90">
          {busy && <span className={`block h-2 w-2 animate-pulse-dot rounded-full ${charging ? "bg-amber" : "bg-blue"}`} />}
          {centerText}
        </div>
        <div className={`relative aspect-square ${frameClass}`}>
          <span className={`${corner} left-0 top-0 rounded-tl-xl border-l-[3px] border-t-[3px]`} />
          <span className={`${corner} right-0 top-0 rounded-tr-xl border-r-[3px] border-t-[3px]`} />
          <span className={`${corner} bottom-0 left-0 rounded-bl-xl border-b-[3px] border-l-[3px]`} />
          <span className={`${corner} bottom-0 right-0 rounded-br-xl border-b-[3px] border-r-[3px]`} />
          {/* 카메라가 없을 때 보여 주는 예시 스티커 */}
          {!hasCamera && (
            <div
              className="absolute left-1/2 top-1/2 flex h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2 -rotate-[4deg] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#F7F9FB] to-[#DDE3EA] shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition-[filter] duration-300"
              style={{ filter: isError ? "blur(2px)" : "none" }}
            >
              <div className="absolute inset-2.5 rounded-[10px] opacity-90 [background:repeating-radial-gradient(circle_at_30%_40%,#8B95A1_0_1px,transparent_1px_6px),repeating-radial-gradient(circle_at_70%_60%,#B8C0CB_0_1px,transparent_1px_5px),repeating-linear-gradient(45deg,rgba(107,118,132,0.25)_0_1px,transparent_1px_7px)]" />
              <span className="relative rounded-md bg-white/85 px-2 py-1 font-inter text-[10px] font-bold tracking-[0.16em] text-gray-6">PUF</span>
            </div>
          )}
          {scanning && (
            <span className="absolute inset-x-2 h-0.5 animate-scan-line bg-gradient-to-r from-blue/0 via-blue to-blue/0 shadow-[0_0_16px_3px_rgba(49,130,246,0.6)]" />
          )}
        </div>
        <div className="h-6 text-sm text-white/70">
          {busy
            ? "움직이지 말고 잠시만 기다려 주세요"
            : isError
              ? "초점과 주변 조명을 확인해 주세요"
              : !hasCamera
                ? "카메라를 켜거나 갤러리에서 이미지를 선택해 주세요"
                : !torchSupported
                  ? "이 기기는 플래시를 지원하지 않아요. 밝은 빛을 쬔 스티커를 어두운 곳에서 촬영해 주세요"
                  : `플래시 ${(settings.chargeMs / 1000).toFixed(1)}초 → 끈 뒤 ${settings.frameCount}장 연속 촬영`}
        </div>
      </div>

      {/* 하단 */}
      <div className="relative z-10 flex flex-col items-center gap-5 px-8 pb-6">
        <div className="flex w-full items-center justify-between">
          {/* 플래시는 촬영 시퀀스 안에서 자동으로 켜졌다 꺼집니다. 상태만 표시합니다. */}
          <span
            role="status"
            aria-label={!torchSupported ? "플래시 사용 불가" : torchOn ? "플래시 충전 중" : "플래시 대기"}
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-300 ${
              !torchSupported ? "bg-white/12 text-white/40" : torchOn ? "bg-amber text-ink" : "bg-white/12 text-white"
            }`}
          >
            {torchSupported ? <Zap size={24} fill={torchOn ? "currentColor" : "none"} /> : <ZapOff size={24} />}
          </span>
          <button
            type="button"
            aria-label="촬영"
            onClick={capture}
            disabled={busy}
            className="flex h-20 w-20 rounded-full border-4 border-white bg-transparent p-1 transition duration-300 hover:brightness-95"
          >
            <span className={`flex flex-1 items-center justify-center rounded-full transition-colors duration-300 ${charging ? "bg-amber" : busy ? "bg-blue" : "bg-white"}`}>
              {busy && <span className="block h-[22px] w-[22px] animate-spin-fast rounded-full border-[3px] border-white/35 border-t-white" />}
            </span>
          </button>
          <button type="button" aria-label="갤러리" onClick={() => fileRef.current?.click()} disabled={busy} className={`${roundBtn} h-14 w-14`}>
            <ImageIcon size={24} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/55">
          <ShieldCheck size={14} />
          촬영한 이미지는 저장되지 않아요
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, value, min, max, step, current, onChange }: { label: string; value: string; min: number; max: number; step: number; current: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="flex justify-between text-sm">
        <span className="font-semibold text-gray-6">{label}</span>
        <span className="font-inter font-semibold text-blue">{value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={current} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-blue" />
    </label>
  );
}
