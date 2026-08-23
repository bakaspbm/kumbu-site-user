import { clsx, type ClassValue } from "clsx";
import type { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Normaliza preços livres (ex.: "5000000") para "5 000 000 Kz". */
export function formatPriceLabel(label: string): string {
  const trimmed = (label ?? "").trim();
  if (!trimmed) return "—";

  if (!/\d/.test(trimmed) || /combinar|negoci|consult/i.test(trimmed)) {
    return trimmed;
  }

  const amount = parsePriceLabel(trimmed);
  if (!(amount > 0)) return trimmed;

  const formatted = new Intl.NumberFormat("pt-AO", {
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);

  const lower = trimmed.toLowerCase();
  let unit = "";
  if (/\/\s*noite|\/\s*dia/.test(lower)) unit = "/noite";
  else if (/\/\s*m[eê]s/.test(lower)) unit = "/mês";
  else if (/\/\s*hora/.test(lower)) unit = "/hora";
  else if (/\/\s*semana/.test(lower)) unit = "/semana";

  return `${formatted} Kz${unit}`;
}

export function parsePriceLabel(label: string): number {
  const trimmed = label.trim();
  if (!trimmed || /combinar|negoci|consult/i.test(trimmed)) return 0;

  let numeric = trimmed.replace(/[^\d,.]/g, "");
  if (!numeric) return 0;

  // 15.000 or 1.234.567 (dot as thousands separator)
  if (/^\d{1,3}(\.\d{3})+$/.test(numeric)) {
    return Number.parseInt(numeric.replace(/\./g, ""), 10) || 0;
  }

  // 15,000 or 1,234,567.89 (comma as thousands separator)
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(numeric)) {
    numeric = numeric.replace(/,/g, "");
  } else if (/^\d{1,3}(\.\d{3})*,\d+$/.test(numeric)) {
    // 15.000,50
    numeric = numeric.replace(/\./g, "").replace(",", ".");
  } else if (numeric.includes(",") && !numeric.includes(".")) {
    numeric = numeric.replace(",", ".");
  }

  return Number.parseFloat(numeric) || 0;
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
