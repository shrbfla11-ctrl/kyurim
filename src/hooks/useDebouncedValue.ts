"use client";

import { useEffect, useState } from "react";

/** 값이 바뀐 뒤 delay(ms) 동안 추가 변경이 없을 때만 반영되는 값을 돌려줍니다. 검색어 입력에 사용합니다. */
export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
