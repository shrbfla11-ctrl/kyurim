"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Pill, TableHead, TableRow, adminInput, adminSelect, card } from "@/components/admin/ui";
import type { Product, Sticker, StickerStatus } from "@/lib/admin/types";
import { issueStickers } from "@/lib/admin/actions";

const cols = "200px 1fr 110px 90px 140px";

const statusPill: Record<StickerStatus, { label: string; cls: string }> = {
  done: { label: "등록 완료", cls: "bg-green-light text-green" },
  processing: { label: "등록 대기", cls: "bg-amber-bg text-amber-dark" },
  failed: { label: "등록 실패", cls: "bg-red-light text-red" },
  revoked: { label: "폐기", cls: "bg-gray-1 text-gray-5" },
};

/**
 * 스티커 발급: 제품 선택 → 수량 입력 → 시리얼 생성(등록 대기).
 * 패턴(감쇠 서명) 등록은 휴대폰에서 스캔 화면의 등록 모드로 실제 스티커를 촬영해 진행합니다.
 */
export function StickerIssuance({ products, initial }: { products: Product[]; initial: Sticker[] }) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [count, setCount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const rows = initial;

  const product = products.find((p) => p.id === productId);
  const doneCount = rows.filter((r) => r.status === "done").length;
  const waitCount = rows.filter((r) => r.status === "processing").length;

  async function issue() {
    if (!product || busy) return;
    setBusy(true);
    setMessage(null);
    const res = await issueStickers(product.id, count);
    setBusy(false);
    if (!res.ok) return setMessage({ ok: false, text: res.error });
    setMessage({ ok: true, text: `${res.serials.length}장 발급 · ${res.serials[0]} ~ ${res.serials[res.serials.length - 1]}` });
    router.refresh();
  }

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
          <div className="flex items-center gap-2.5"><span className={step}>2</span><span className="text-base font-bold">발급 수량</span></div>
          <input
            type="number"
            min={1}
            max={500}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
            className={`${adminInput} mt-4 h-[52px] w-full font-inter text-[15px]`}
          />
          <div className="mt-2 text-[13px] text-gray-4">한 번에 최대 500장. 시리얼이 &quot;등록 대기&quot; 상태로 만들어져요.</div>
          {message && <div className={`mt-4 text-sm font-semibold ${message.ok ? "text-green" : "text-red"}`}>{message.text}</div>}
          <Button full className="mt-5" onClick={issue} disabled={!product || busy} loading={busy} loadingLabel="발급 중...">스티커 발급하기</Button>
        </div>

        <div className={`${card} flex items-start gap-3 p-5`}>
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-blue-light text-blue"><Smartphone size={20} /></span>
          <div className="text-sm leading-relaxed text-gray-6">
            <div className="font-bold text-ink">3. 휴대폰에서 패턴 등록</div>
            관리자 계정으로 휴대폰에서 스캔 화면을 열고 <strong>등록 모드</strong> 를 켠 뒤 시리얼을 입력하고 실제 스티커를 촬영하면 감쇠 패턴이 저장돼요. 아래 표의 &quot;등록&quot; 링크를 휴대폰에서 열면 시리얼이 자동으로 입력돼요.
          </div>
        </div>
      </div>

      <div className={`${card} overflow-hidden`}>
        <div className="flex items-center justify-between px-6 pb-4 pt-6">
          <div className="text-lg font-bold">최근 발급</div>
          <div className="flex gap-4 text-[13px] text-gray-5">
            <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-green" />등록 완료 <span className="font-inter font-semibold text-ink">{doneCount}</span></span>
            <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber" />등록 대기 <span className="font-inter font-semibold text-ink">{waitCount}</span></span>
          </div>
        </div>
        <TableHead cols={cols}>
          <span>스티커 ID</span><span>제품</span><span>발급일</span><span className="text-right">비즈</span><span className="text-right">상태</span>
        </TableHead>
        {rows.map((r) => {
          const s = statusPill[r.status];
          return (
            <TableRow key={r.id} cols={cols}>
              <span className="font-inter text-sm font-semibold">{r.id}</span>
              <span className="text-gray-6">{r.product}</span>
              <span className="font-inter text-sm text-gray-5">{r.issuedAt}</span>
              <span className="text-right font-inter text-sm text-gray-5">{r.beads ?? "-"}</span>
              <span className="flex items-center justify-end gap-2">
                <Pill cls={s.cls}>{s.label}</Pill>
                {r.status !== "revoked" && (
                  <Link href={`/scan?enroll=${encodeURIComponent(r.id)}`} className="text-[13px] font-semibold text-blue hover:underline">
                    {r.status === "done" ? "재등록" : "등록"}
                  </Link>
                )}
              </span>
            </TableRow>
          );
        })}
        {rows.length === 0 && <div className="px-6 py-16 text-center text-[15px] text-gray-4">아직 발급된 스티커가 없어요.</div>}
      </div>
    </div>
  );
}
