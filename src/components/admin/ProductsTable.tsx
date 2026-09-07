"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Ellipsis, ImagePlus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/Input";
import { SearchInput } from "@/components/ui/SearchInput";
import { ProductThumb, TableHead, TableRow, adminSelect, card } from "@/components/admin/ui";
import { categories, type Category, type Product } from "@/lib/admin/types";
import { createProduct } from "@/lib/admin/actions";

const cols = "1fr 140px 140px 140px 80px";
const PAGE = 10;

/** 제품 목록 표 + 제품 등록 모달. 등록은 서버 액션으로 저장한 뒤 목록을 새로 고칩니다. */
export function ProductsTable({ initial }: { initial: Product[] }) {
  const router = useRouter();
  const items = initial;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | Category>("all");
  const [page, setPage] = useState(1);
  const search = useCallback((v: string) => {
    setQ(v);
    setPage(1);
  }, []);
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return items.filter((p) => (cat === "all" || p.category === cat) && (!kw || `${p.name} ${p.maker}`.toLowerCase().includes(kw)));
  }, [items, q, cat]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const view = list.slice((page - 1) * PAGE, page * PAGE);

  return (
    <>
      <div className="mb-8 -mt-[92px] flex justify-end">
        <Button size="md" onClick={() => setOpen(true)} icon={<Plus size={18} strokeWidth={2.5} />}>제품 등록</Button>
      </div>

      <div className={`${card} overflow-hidden`}>
        <div className="flex gap-2 border-b border-gray-1 px-6 py-4">
          <SearchInput size="md" placeholder="제품명 검색" onSearch={search} className="max-w-[360px] flex-1" />
          <select value={cat} onChange={(e) => { setCat(e.target.value as typeof cat); setPage(1); }} className={adminSelect}>
            <option value="all">전체 카테고리</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <TableHead cols={cols}>
          <span>제품명</span><span>카테고리</span><span className="text-right">발급 스티커</span><span className="text-right">등록일</span><span />
        </TableHead>
        {view.map((p) => (
          <TableRow key={p.id} cols={cols}>
            <span className="flex items-center gap-3">
              <ProductThumb />
              <span>
                <span className="block font-semibold">{p.name}</span>
                <span className="block text-[13px] text-gray-4">{p.maker}</span>
              </span>
            </span>
            <span className="text-gray-6">{p.category}</span>
            <span className="text-right font-inter">{p.stickers.toLocaleString()}</span>
            <span className="text-right font-inter text-sm text-gray-5">{p.createdAt}</span>
            <span className="flex justify-end">
              <button type="button" aria-label="더보기" className="flex h-9 w-9 items-center justify-center rounded-[10px] text-gray-4 hover:bg-gray-1 hover:brightness-100">
                <Ellipsis size={18} />
              </button>
            </span>
          </TableRow>
        ))}
        {view.length === 0 && <div className="px-6 py-16 text-center text-[15px] text-gray-4">조건에 맞는 제품이 없어요.</div>}

        <div className="flex items-center justify-between px-6 py-4 text-sm text-gray-5">
          <span>총 <span className="font-inter font-semibold text-ink">{list.length}</span>개 제품</span>
          <span className="flex gap-1">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`h-9 w-9 rounded-[10px] font-inter font-semibold transition-colors duration-300 hover:brightness-100 ${n === page ? "bg-blue text-white" : "text-gray-6 hover:bg-gray-1"}`}
              >
                {n}
              </button>
            ))}
          </span>
        </div>
      </div>

      {open && (
        <CreateProductModal
          onClose={() => setOpen(false)}
          onCreated={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function CreateProductModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [maker, setMaker] = useState("");
  const [category, setCategory] = useState<Category>(categories[0]);
  const [desc, setDesc] = useState("");
  const [errors, setErrors] = useState<{ name?: string; maker?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs = { name: name.trim() ? undefined : "제품명을 입력해 주세요.", maker: maker.trim() ? undefined : "제조사를 입력해 주세요." };
    setErrors(errs);
    if (errs.name || errs.maker) return;
    setBusy(true);
    const res = await createProduct({ name, maker, category, description: desc });
    setBusy(false);
    if (!res.ok) return setErrors({ form: res.error });
    onCreated();
  }

  const field = "h-12 w-full rounded-xl border-[1.5px] border-transparent bg-gray-1 px-3.5 text-[15px] text-ink outline-none transition-colors duration-300 focus:border-blue focus:bg-white";
  const label = "mb-1.5 block text-[13px] font-semibold text-gray-6";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-6" onClick={onClose}>
      <form onSubmit={submit} noValidate onClick={(e) => e.stopPropagation()} className="flex w-[560px] flex-col gap-6 rounded-3xl bg-white p-8 shadow-[0_24px_64px_rgba(25,31,40,0.24)]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.03em]">제품 등록</h2>
            <p className="mt-1 text-sm text-gray-5">등록 후 스티커를 발급할 수 있어요.</p>
          </div>
          <button type="button" aria-label="닫기" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-1 text-gray-6 hover:bg-gray-2 hover:brightness-100">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-start gap-5">
          <label className="flex h-[140px] w-[140px] flex-none cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-gray-3 bg-[#F9FAFB] text-gray-4 transition-colors duration-300 hover:border-blue hover:bg-blue-light">
            <ImagePlus size={24} />
            <span className="text-xs font-semibold">이미지 업로드</span>
            <input type="file" accept="image/*" className="hidden" />
          </label>
          <div className="flex flex-1 flex-col gap-3">
            <label>
              <span className={label}>제품명</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 글로우 리페어 세럼 50ml" className={`${field} ${errors.name ? "border-red" : ""}`} />
              {errors.name && <ErrorText>{errors.name}</ErrorText>}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={label}>카테고리</span>
                <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className={field}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label>
                <span className={label}>제조사</span>
                <input value={maker} onChange={(e) => setMaker(e.target.value)} placeholder="제조사명" className={`${field} ${errors.maker ? "border-red" : ""}`} />
                {errors.maker && <ErrorText>{errors.maker}</ErrorText>}
              </label>
            </div>
          </div>
        </div>

        <label>
          <span className={label}>제품 설명</span>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="소비자에게 표시되는 제품 설명을 입력하세요." className="h-24 w-full resize-none rounded-xl border-[1.5px] border-transparent bg-gray-1 px-3.5 py-3 text-[15px] leading-normal text-ink outline-none transition-colors duration-300 focus:border-blue focus:bg-white" />
        </label>

        {errors.form && <ErrorText>{errors.form}</ErrorText>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose} className="bg-gray-1 text-gray-6">취소</Button>
          <Button type="submit" size="md" loading={busy} loadingLabel="등록 중...">등록하기</Button>
        </div>
      </form>
    </div>
  );
}
