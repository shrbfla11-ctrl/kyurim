"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CircleHelp, Image as ImageIcon, ShieldCheck, TriangleAlert, X, Zap, ZapOff } from "lucide-react";

type ScanState = "idle" | "scanning" | "error";

const roundBtn =
  "flex items-center justify-center rounded-full border-0 bg-white/12 text-white transition duration-300 hover:bg-white/22 disabled:opacity-50";

/**
 * 카메라 스캔 화면. 기기 카메라를 열어 스티커를 촬영하고 /api/scan 으로 보낸 뒤 결과 화면으로 이동합니다.
 * 카메라를 쓸 수 없는 환경에서는 디자인의 어두운 배경 위에 갤러리 업로드만 제공합니다.
 */
export function ScanView({ frameClass = "w-[240px]" }: { frameClass?: string }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<ScanState>("idle");
  const [hasCamera, setHasCamera] = useState(false);
  const [torch, setTorch] = useState(false);
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
        // 플래시(토치)는 기본으로 켭니다. 지원하지 않는 기기(iPhone 등)에서는 조용히 넘어갑니다.
        const track = stream.getVideoTracks()[0];
        const caps = track?.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined;
        if (caps?.torch) {
          try {
            await track.applyConstraints({ advanced: [{ torch: true } as MediaTrackConstraintSet] });
            setTorch(true);
          } catch {
            /* 켜지지 않아도 촬영은 가능 */
          }
        }
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
        const data = (await res.json()) as { outcome: string; scannedAt: string };
        streamRef.current?.getTracks().forEach((t) => t.stop());
        router.push(`/scan/result?outcome=${encodeURIComponent(data.outcome)}&at=${encodeURIComponent(data.scannedAt)}`);
      } catch {
        showError("분석에 실패했어요", "네트워크 상태를 확인하고 다시 시도해 주세요.");
      }
    },
    [router, showError],
  );

  function capture() {
    if (state === "scanning") return;
    const video = videoRef.current;
    if (!hasCamera || !video || video.videoWidth === 0) {
      showError("카메라를 사용할 수 없어요", "카메라 권한을 허용하거나 갤러리에서 이미지를 선택해 주세요.");
      return;
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
        if (!blob) return showError("초점이 맞지 않아요", "밝은 곳에서 스티커에 가까이 대고 다시 촬영해 주세요.");
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

  const scanning = state === "scanning";
  const isError = state === "error";
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
          {scanning && <span className="block h-2 w-2 animate-pulse-dot rounded-full bg-blue" />}
          {scanning ? "패턴을 대조하고 있어요…" : "스티커를 사각형 안에 맞춰 주세요"}
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
          {scanning
            ? "움직이지 말고 잠시만 기다려 주세요"
            : isError
              ? "초점과 조명을 확인해 주세요"
              : !hasCamera
                ? "카메라를 켜거나 갤러리에서 이미지를 선택해 주세요"
                : !torch
                  ? "이 기기는 플래시를 지원하지 않아요. 밝은 곳에서 촬영해 주세요"
                  : ""}
        </div>
      </div>

      {/* 하단 */}
      <div className="relative z-10 flex flex-col items-center gap-5 px-8 pb-6">
        <div className="flex w-full items-center justify-between">
          {/* 플래시는 패턴 인식에 필수라 항상 켜 둡니다. 상태만 표시하고 끌 수 없습니다. */}
          <span
            role="status"
            aria-label={torch ? "플래시 켜짐" : "플래시 사용 불가"}
            className={`flex h-14 w-14 items-center justify-center rounded-full ${torch ? "bg-amber text-ink" : "bg-white/12 text-white/40"}`}
          >
            {torch ? <Zap size={24} fill="currentColor" /> : <ZapOff size={24} />}
          </span>
          <button
            type="button"
            aria-label="촬영"
            onClick={capture}
            disabled={scanning}
            className="flex h-20 w-20 rounded-full border-4 border-white bg-transparent p-1 transition duration-300 hover:brightness-95"
          >
            <span className={`flex flex-1 items-center justify-center rounded-full transition-colors duration-300 ${scanning ? "bg-blue" : "bg-white"}`}>
              {scanning && <span className="block h-[22px] w-[22px] animate-spin-fast rounded-full border-[3px] border-white/35 border-t-white" />}
            </span>
          </button>
          <button type="button" aria-label="갤러리" onClick={() => fileRef.current?.click()} disabled={scanning} className={`${roundBtn} h-14 w-14`}>
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
