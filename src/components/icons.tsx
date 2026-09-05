import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 24, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...rest,
  };
}

export function CameraIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export function ScanIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3M8 12h8" />
    </svg>
  );
}

export function InfoIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

export function CheckIcon(p: IconProps) {
  return (
    <svg {...base({ strokeWidth: 3, ...p })}>
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

export function WarningIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  );
}

export function SearchIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.5-4.5" />
    </svg>
  );
}

export function ShapesIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="8" cy="8" r="4" />
      <rect x="13" y="13" width="7" height="7" rx="2" />
    </svg>
  );
}

export function BookmarkIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 4h12v17l-6-4-6 4z" />
    </svg>
  );
}

export function FamilyIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20a6 6 0 0112 0M14 20a4 4 0 017 0" />
    </svg>
  );
}

export function ShieldIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function MenuIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
