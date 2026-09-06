import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "white" | "kakao" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-blue text-white",
  secondary: "bg-blue-light text-blue",
  white: "bg-white text-blue",
  kakao: "bg-kakao text-ink",
  outline: "border-[1.5px] border-gray-2 bg-white text-ink",
  ghost: "bg-transparent text-gray-5",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-10 rounded-xl px-4 gap-2",
  md: "h-11 rounded-xl px-5 gap-2",
  lg: "h-14 rounded-2xl px-7 gap-2",
};

// 글자 크기·굵기. 소셜 로그인 버튼(kakao, outline)은 디자인상 한 단계 작고 가벼운 글자를 씁니다.
function fontClass(variant: ButtonVariant, size: ButtonSize) {
  if (size === "sm") return "text-sm font-bold";
  if (size === "md") return "text-[15px] font-bold";
  if (variant === "kakao" || variant === "outline") return "text-base font-semibold gap-2.5";
  return "text-[17px] font-bold";
}

const baseClass =
  "inline-flex items-center justify-center transition duration-300 " +
  "hover:brightness-[0.96] disabled:cursor-not-allowed disabled:hover:brightness-100";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & { href?: undefined };
type ButtonAsLink = CommonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function classes({ variant = "primary", size = "lg", full, loading, className }: CommonProps) {
  return [
    baseClass,
    variantClass[variant],
    sizeClass[size],
    fontClass(variant, size),
    full ? "w-full" : "",
    loading ? "opacity-85" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

function Spinner() {
  return (
    <span className="block h-5 w-5 animate-spin-fast rounded-full border-[2.5px] border-current/35 border-t-current" />
  );
}

/**
 * 공용 버튼. href 를 주면 Link 로, 없으면 <button> 으로 렌더링됩니다.
 * 호버 시 살짝 어두워지는 효과와 0.3초 전환을 기본으로 포함합니다.
 */
export function Button(props: ButtonProps) {
  const { variant, size, full, loading, loadingLabel, icon, className, children, ...rest } = props;
  const cls = classes({ variant, size, full, loading, className, children });
  const content = (
    <>
      {loading ? <Spinner /> : icon}
      {loading && loadingLabel ? loadingLabel : children}
    </>
  );

  if ("href" in rest && typeof rest.href === "string") {
    const { href, ...anchor } = rest as ButtonAsLink;
    const external = /^(https?:)?\/\//.test(href) || href.startsWith("#");
    if (external) {
      return (
        <a href={href} className={cls} {...anchor}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...anchor}>
        {content}
      </Link>
    );
  }

  const button = rest as ButtonAsButton;
  return (
    <button type="button" {...button} disabled={loading || button.disabled} className={cls}>
      {content}
    </button>
  );
}
