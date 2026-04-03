import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(n: number, currency?: string | null) {
  const c = currency ?? "USD";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format(n);
  } catch {
    return `${n.toFixed(2)} ${c}`;
  }
}

export function formatDate(d: Date | string) {
  const x = typeof d === "string" ? new Date(d) : d;
  return x.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
