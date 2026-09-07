"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const DURATION = 300;

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** 같은 페이지 안의 #앵커 링크 클릭을 가로채 300ms 동안 부드럽게 스크롤합니다. */
export function SmoothAnchors() {
  const pathname = usePathname();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest("a[href]");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const hash = href.startsWith("#") ? href : href.startsWith(`${pathname}#`) ? href.slice(pathname.length) : null;
      if (!hash || hash === "#") return;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      const start = window.scrollY;
      const end = target.getBoundingClientRect().top + start - 16;
      const t0 = performance.now();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || document.hidden) {
        window.scrollTo(0, end);
      } else {
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / DURATION);
          window.scrollTo(0, start + (end - start) * easeInOut(p));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
      history.pushState(null, "", hash);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  return null;
}
