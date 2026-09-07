"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState, type InputHTMLAttributes } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "size"> & {
  /** 디바운스가 적용된 검색어를 돌려줍니다. */
  onSearch: (value: string) => void;
  /** 디바운스 지연(ms). 기본 300 */
  delay?: number;
  size?: "md" | "lg";
};

/**
 * 공용 검색 입력. 입력값은 즉시 화면에 반영되고, onSearch 는 디바운스된 값으로만 호출됩니다.
 * 목록 필터링이나 서버 검색 어디에나 같은 방식으로 쓸 수 있습니다.
 */
export function SearchInput({ onSearch, delay = 300, size = "lg", className, ...rest }: Props) {
  const [value, setValue] = useState("");
  const debounced = useDebouncedValue(value, delay);

  useEffect(() => {
    onSearch(debounced.trim());
  }, [debounced, onSearch]);

  const h = size === "lg" ? "h-[52px] rounded-[14px] pl-11 pr-10 text-[15px]" : "h-11 rounded-xl pl-10 pr-9 text-sm";
  const icon = size === "lg" ? "left-4 top-4" : "left-3.5 top-3";

  return (
    <label className={`relative block ${className ?? ""}`}>
      <Search size={size === "lg" ? 20 : 18} className={`pointer-events-none absolute ${icon} text-gray-4`} />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`${h} w-full border-[1.5px] border-transparent bg-gray-1 text-ink outline-none transition-colors duration-300 focus:border-blue focus:bg-white [&::-webkit-search-cancel-button]:hidden`}
        {...rest}
      />
      {value && (
        <button
          type="button"
          aria-label="검색어 지우기"
          onClick={() => setValue("")}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-4 hover:bg-gray-2 hover:brightness-100"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      )}
    </label>
  );
}
