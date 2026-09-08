"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SIZE = 512;
const MAX_BYTES = 10 * 1024 * 1024;

/** 이미지를 중앙 정사각형으로 잘라 SIZE px JPEG 로 줄입니다. */
async function squareJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob"))), "image/jpeg", 0.88));
}

/** 프로필 사진: 표시 + 변경/삭제. 사진은 avatars 버킷의 본인 폴더에 저장되고 profiles.avatar_url 에 기록됩니다. */
export function AvatarUploader({ userId, avatarUrl, fallback, canRemove }: { userId: string; avatarUrl: string | null; fallback: string; canRemove: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) return setError("이미지 파일만 올릴 수 있어요.");
    if (file.size > MAX_BYTES) return setError("10MB 이하 이미지를 올려 주세요.");
    setBusy(true);
    setError(null);
    try {
      const blob = await squareJpeg(file);
      const path = `${userId}/avatar-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, blob, { contentType: "image/jpeg" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", userId);
      if (dbErr) throw dbErr;
      await removeOldFiles(path);
      router.refresh();
    } catch {
      setError("사진을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  async function removeOldFiles(keep?: string) {
    const { data: files } = await supabase.storage.from("avatars").list(userId);
    const targets = (files ?? []).map((f) => `${userId}/${f.name}`).filter((p) => p !== keep);
    if (targets.length) await supabase.storage.from("avatars").remove(targets);
  }

  async function remove() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const { error: dbErr } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
    if (dbErr) {
      setBusy(false);
      return setError("사진을 삭제하지 못했어요.");
    }
    await removeOldFiles();
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Avatar className="size-16">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
          <AvatarFallback className="bg-blue-light text-2xl font-bold text-blue">{fallback}</AvatarFallback>
        </Avatar>
        <button
          type="button"
          aria-label="사진 변경"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-ink text-white transition duration-300 hover:bg-gray-6 hover:brightness-100 disabled:opacity-50"
        >
          <Camera size={14} />
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) upload(f); }} />
      </div>
      {canRemove && (
        <button type="button" onClick={remove} disabled={busy} className="flex items-center gap-1 text-xs font-semibold text-gray-4 transition-colors duration-300 hover:text-red hover:brightness-100 disabled:opacity-50">
          <Trash2 size={12} />삭제
        </button>
      )}
      {busy && <span className="text-xs text-gray-4">저장 중…</span>}
      {error && <span className="max-w-[200px] text-center text-xs font-semibold text-red">{error}</span>}
    </div>
  );
}
