"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Pill, TableHead, TableRow, adminSelect, card } from "@/components/admin/ui";
import type { Product, Sticker, StickerStatus } from "@/lib/admin/mock";

const cols = "200px 1fr 140px 120px";
const MAX_FILES = 500;

const statusPill: Record<StickerStatus, { label: string; cls: string }> = {
  done: { label: "등록 완료", cls: "bg-green-light text-green" },
  processing: { label: "처리 중", cls: "bg-blue-light text-blue" },
  failed: { label: "패턴 인식 실패", cls: "bg-red-light text-red" },
};

/**
 * 스티커 발급: 제품 선택 → 패턴 이미지 업로드 → 발급 결과.
 * 패턴 등록 엔진이 연결되기 전까지 업로드 진행률과 결과는 화면에서만 시뮬레이션됩니다.
 */
export function StickerIssuance({ products, initial }: { products: Product[]; initial: Sticker[] }) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [rows, setRows] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | null>(null);

  const product = products.find((p) => p.id === productId);
  const doneCount = rows.filter((r) => r.status === "done").length;
  const failCount = rows.filter((r) => r.status === "failed").length;

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = Array.from(list).filter((f) => /image\/(png|tiff)/.test(f.type) || /\.(png|tiff?)$/i.test(f.name));
    setFiles((prev) => [...prev, ...next].slice(0, MAX_FILES));
  }

  function issue() {
    if (!product || files.length === 0 || progress) return;
    const total = files.length;
    const today = new Date();
    const issuedAt = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;
    const prefix = `PUF-${product.maker.slice(0, 2).toUpperCase().replace(/[^A-Z]/g, "X")}${String(today.getFullYear()).slice(2)}`;
    setProgress({ done: 0, total });
    let done = 0;
    timer.current = window.setInterval(() => {
      done = Math.min(total, done + Math.max(1, Math.round(total / 20)));
      setProgress({ done, total });
      if (done >= total) {
        if (timer.current) window.clearInterval(timer.current);
        const created: Sticker[] = files.map((f, i) => ({
          id: `${prefix}-${String(Date.now() % 1000000 + i).padStart(6, "0")}`,
          product: product.name,
          issuedAt,
          status: f.size === 0 ? "failed" : "done",
        }));
        setRows((prev) => [...created.reverse(), ...prev]);
        setFiles([]);
        window.setTimeout(() => setProgress(null), 800);
      }
    }, 120);
  }

  const pct = progress ? Math.round((progress.done / progress.total) * 100) : 0;
  const step = "flex h-7 w-7 items-center justify-center rounded-full bg-blue font-inter text-[13px] font-bold text-white";

  return (
    <div className="grid grid-cols-[400px_1fr] items-start gap-6">
      <div className="flex flex-col gap-4">
        <div className={`${card} p-6`}>
          <div className="flex items-center gap-2.5"><span className={step}>1</span><span className="text-base font-bold">제품 선택</span></div>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className={`${adminSelect} mt-4 h-[52px] w-full text-[15px] font-normal text-ink`}>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {product && (
            <div className="mt-3 text-[13px] text-gray-4">
              현재 발급 <span className="font-inter font-semibold text-gray-6">{product.stickers.toLocaleString()}</span>개 · {product.maker}
            </div>
          )}
        </div>

        <div className={`${card} p-6`}>
          <div className="flex items-center gap-2.5"><span className={step}>2</span><span className="text-base font-bold">패턴 이미지 업로드</span></div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            className={`mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-[1.5px] border-dashed px-6 py-8 text-center text-gray-5 transition-colors duration-300 hover:border-blue hover:bg-blue-light ${dragging ? "border-blue bg-blue-light" : "border-gray-3 bg-[#F9FAFB]"}`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-blue-light text-blue"><Upload size={24} /></span>
            <span className="text-[15px] font-bold text-ink">{files.length ? `${files.length}장 선택됨` : "파일을 끌어다 놓거나 클릭"}</span>
            <span className="text-[13px]">PNG · TIFF, 최대 {MAX_FILES}장 / 회</span>
            <input ref={inputRef} type="file" accept="image/png,image/tiff,.tif,.tiff" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
          </div>

          {progress && (
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-6">업로드 중 · <span className="font-inter font-semibold text-ink">{progress.done} / {progress.total}</span></span>
                <span className="font-inter font-semibold text-blue">{pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-1">
                <div className="h-full rounded-full bg-blue transition-[width] duration-300" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          <Button full className="mt-5" onClick={issue} disabled={!product || files.length === 0 || !!progress} loading={!!progress} loadingLabel="발급 중...">
            스티커 발급하기
          </Button>
        </div>
      </div>

      <div className={`${card} overflow-hidden`}>
        <div className="flex items-center justify-between px-6 pb-4 pt-6">
          <div className="text-lg font-bold">발급 결과</div>
          <div className="flex gap-4 text-[13px] text-gray-5">
            <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-green" />등록 완료 <span className="font-inter font-semibold text-ink">{doneCount}</span></span>
            <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-red" />실패 <span className="font-inter font-semibold text-ink">{failCount}</span></span>
          </div>
        </div>
        <TableHead cols={cols}>
          <span>스티커 ID</span><span>제품</span><span>발급일</span><span className="text-right">상태</span>
        </TableHead>
        {rows.slice(0, 30).map((r) => {
          const s = statusPill[r.status];
          return (
            <TableRow key={r.id} cols={cols}>
              <span className="font-inter text-sm font-semibold">{r.id}</span>
              <span className="text-gray-6">{r.product}</span>
              <span className="font-inter text-sm text-gray-5">{r.issuedAt}</span>
              <span className="text-right"><Pill cls={s.cls}>{s.label}</Pill></span>
            </TableRow>
          );
        })}
      </div>
    </div>
  );
}
