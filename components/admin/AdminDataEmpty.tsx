import type { ReactNode } from "react";

type Variant = "sessions" | "users" | "revenue";

const illustrations: Record<Variant, { viewBox: string; paths: ReactNode }> = {
  sessions: {
    viewBox: "0 0 120 100",
    paths: (
      <>
        <rect
          x="18"
          y="22"
          width="84"
          height="56"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-border-subtle opacity-80"
        />
        <path
          d="M32 38h56M32 52h40M32 66h48"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-tertiary opacity-60"
        />
        <circle cx="88" cy="30" r="6" fill="var(--accent)" opacity="0.35" />
      </>
    ),
  },
  users: {
    viewBox: "0 0 120 100",
    paths: (
      <>
        <circle
          cx="48"
          cy="36"
          r="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-border-subtle"
        />
        <path
          d="M28 78c4-14 16-22 40-22s36 8 40 22"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-border-subtle opacity-90"
        />
        <circle cx="82" cy="40" r="8" fill="var(--accent-dim)" stroke="var(--accent)" strokeWidth="1.5" />
      </>
    ),
  },
  revenue: {
    viewBox: "0 0 120 100",
    paths: (
      <>
        <rect
          x="22"
          y="58"
          width="14"
          height="28"
          rx="3"
          fill="var(--accent)"
          opacity="0.25"
        />
        <rect
          x="46"
          y="44"
          width="14"
          height="42"
          rx="3"
          fill="var(--accent)"
          opacity="0.45"
        />
        <rect
          x="70"
          y="52"
          width="14"
          height="34"
          rx="3"
          fill="var(--accent)"
          opacity="0.35"
        />
        <path
          d="M18 28h84"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="text-tertiary opacity-50"
        />
      </>
    ),
  },
};

export function AdminDataEmpty({
  variant,
  title,
  description,
}: {
  variant: Variant;
  title: string;
  description: string;
}) {
  const art = illustrations[variant];
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <svg
        className="mb-6 h-24 w-auto text-foreground"
        viewBox={art.viewBox}
        fill="none"
        aria-hidden
      >
        {art.paths}
      </svg>
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
    </div>
  );
}
