"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CircleHelp, Image as ImageIcon, ShieldCheck, TriangleAlert, X, Zap, ZapOff } from "lucide-react";

type ScanState = "idle" | "charging" | "capturing" | "scanning" | "error";

/** 축광 비즈에 빛을 먹이는 시간(ms). 실제 스티커로 테스트하며 조정합니다. */
const CHARGE_MS = 2500;
/** 플래시를 끈 뒤 카메라 노출이 어두운 장면에 맞춰지도록 기다리는 시간(ms) */
const SETTLE_MS = 400;

const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

const roundBtn =
  "flex items-center justify-center rounded-full border-0 bg-white/12 text-white transition duration-300 hover:bg-white/22 disabled:opacity-50";

/**
 * 카메라 스캔 화면. 스티커의 축광 비즈는 플래시로 빛을 먹인 뒤 플래시를 끄고 찍어야 패턴이 보입니다.
 * 촬영 버튼 한 번으로 [플래시 ON 충전 → 플래시 OFF → 자동 촬영 → /api/scan] 순서가 진행됩니다.
 * 카메라를 쓸 수 없는 환경에서는 디자인의 어두운 배경 위에 갤러리 업로드만 제공합니다.
 */
export function ScanView({ frameClass = "w-[240px]" }: { frameClass?: string }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<ScanState>("idle");
  const [hasCamera, setHasCamera] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<{ title: string; desc: string } | null>(null);

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

  const analyze = useCallback(
    async (image: Blob) => {
      setState("scanning");
      try {
        const form = new FormData();
        form.append("image", image, "scan.jpg");
        const res = await fetch("/api/scan", { method: "POST", body: form });
        if (!res.ok) throw new Error("bad response");
        const data = (await res.json()) as { id: string };
        streamRef.current?.getTracks().forEach((t) => t.stop());
        router.push(`/scan/result?id=${encodeURIComponent(data.id)}`);
      } catch {
        showError("분석에 실패했어요", "네트워크 상태를 확인하고 다시 시도해 주세요.");
      }
    },
    [router, showError],
  );

  async function capture() {
    if (state !== "idle") return;
    const video = videoRef.current;
    if (!hasCamera || !video || video.videoWidth === 0) {
      showError("카메라를 사용할 수 없어요", "카메라 권한을 허용하거나 갤러리에서 이미지를 선택해 주세요.");
      return;
    }
    // 1) 플래시로 비즈에 빛을 먹이고 2) 플래시를 끈 뒤 노출이 안정되면 3) 촬영합니다.
    if (torchSupported) {
      setState("charging");
      const lit = await setTorch(true);
      if (lit) await sleep(CHARGE_MS);
      await setTorch(false);
      setState("capturing");
      await sleep(SETTLE_MS);
    } else {
      setState("capturing");
    }
    // 가이드 프레임(중앙 정사각형) 영역만 잘라서 보냅니다.
    const side = Math.min(video.videoWidth, video.videoHeight) * 0.7;
    const sx = (video.videoWidth - side) / 2;
    const sy = (video.videoHeight - side) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, sx, sy, side, side, 0, 0, 1024, 1024);
    canvas.toBlob(
      (blob) => {
        if (!blob) return showError("초점이 맞지 않아요", "스티커에 가까이 대고 흔들리지 않게 다시 촬영해 주세요.");
        analyze(blob);
      },
      "image/jpeg",
      0.9,
    );
  }

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) analyze(file);
  }

  const charging = state === "charging";
  const busy = state !== "idle" && state !== "error";
  const scanning = state === "scanning";
  const isError = state === "error";
  const centerText = charging
    ? "빛을 충전하고 있어요…"
    : state === "capturing"
      ? "촬영 중이에요"
      : scanning
        ? "패턴을 대조하고 있어요…"
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
        <Link href="/guide" aria-label="도움말" className={`${roundBtn} h-11 w-11`}>
          <CircleHelp size={22} />
        </Link>
      </div>

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
                  : "촬영을 누르면 플래시가 잠깐 켜졌다가 꺼진 뒤 자동으로 찍혀요"}
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
