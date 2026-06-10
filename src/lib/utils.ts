import { clsx, type ClassValue } from "clsx";
import type { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPriceLabel(label: string): string {
  return label.trim() || "—";
}

export function parsePriceLabel(label: string): number {
  const digits = label.replace(/[^\d,.]/g, "").replace(",", ".");
  return Number.parseFloat(digits) || 0;
}

export function hexToCssColor(hex: string | null | undefined, fallback: string): string {
  if (!hex?.trim()) return fallback;
  const h = hex.replace("#", "");
  if (h.length === 6) return `#${h}`;
  if (h.length === 8) return `#${h.slice(2)}`;
  return fallback;
}

export function productPlaceholderStyle(imageColor?: number | null): CSSProperties {
  if (imageColor == null) {
    return { backgroundColor: "rgba(214, 40, 40, 0.12)" };
  }
  const argb = imageColor >>> 0;
  const a = ((argb >> 24) & 0xff) / 255;
  const r = (argb >> 16) & 0xff;
  const g = (argb >> 8) & 0xff;
  const b = argb & 0xff;
  return { backgroundColor: `rgba(${r}, ${g}, ${b}, ${a || 1})` };
}
