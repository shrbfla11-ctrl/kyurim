"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { CheckIcon, ErrorIcon, EyeIcon, EyeOffIcon } from "@/components/icons";

const inputBase =
  "h-14 w-full rounded-[14px] border-[1.5px] bg-gray-1 px-4 text-base text-ink outline-none transition-colors duration-300 focus:border-blue focus:bg-white";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
};

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="mb-2 block text-sm font-semibold text-gray-6">{children}</span>;
}

/** 라벨 + 텍스트 입력. error 가 있으면 빨간 테두리와 문구를 표시합니다. */
export function TextField({ label, error, hint, className, ...rest }: FieldProps) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        {...rest}
        aria-invalid={!!error}
        className={`${inputBase} ${error ? "border-red" : "border-transparent"} ${className ?? ""}`}
      />
      {error ? <ErrorText>{error}</ErrorText> : hint}
    </label>
  );
}

/** 보기/숨기기 토글이 있는 비밀번호 입력. */
export function PasswordField({ label, error, hint, className, ...rest }: FieldProps) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <span className="relative block">
        <input
          {...rest}
          type={show ? "text" : "password"}
          aria-invalid={!!error}
          className={`${inputBase} pr-[52px] ${error ? "border-red" : "border-transparent"} ${className ?? ""}`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
          className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-[10px] text-gray-4"
        >
          {show ? <EyeOffIcon size={22} /> : <EyeIcon size={22} />}
        </button>
      </span>
      {error ? <ErrorText>{error}</ErrorText> : hint}
    </label>
  );
}

export function Checkbox({
  children,
  right,
  strong,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { children: ReactNode; right?: ReactNode; strong?: boolean }) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-2 ${strong ? "text-[15px] font-bold text-ink" : "text-sm text-gray-6"}`}
    >
      <span className="flex items-center gap-2.5">
        <input type="checkbox" {...rest} className="m-0 h-5 w-5 accent-blue" />
        {children}
      </span>
      {right}
    </label>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <span className="mt-2 flex items-center gap-1.5 text-[13px] text-red">
      <ErrorIcon size={14} />
      {children}
    </span>
  );
}

export function SuccessText({ children }: { children: ReactNode }) {
  return (
    <span className="mt-2 flex items-center gap-1.5 text-[13px] text-green">
      <CheckIcon size={14} />
      {children}
    </span>
  );
}

/** 폼 전체에 대한 오류 박스 (서버 응답 오류 등). */
export function FormError({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-[14px] bg-red/10 px-4 py-3 text-sm text-red">
      <ErrorIcon size={16} className="mt-0.5 flex-none" />
      <span>{children}</span>
    </div>
  );
}
