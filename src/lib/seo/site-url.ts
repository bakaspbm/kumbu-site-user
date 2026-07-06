import { getCanonicalSiteOrigin } from "@/lib/urls/canonical-site-origin";

export function siteOrigin(): string {
  return getCanonicalSiteOrigin();
}

export function absoluteSiteUrl(path: string): string {
  const base = siteOrigin();
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Converte URLs relativas de assets (ex. /backend-files/…) em URLs absolutas para OG/sitemap. */
export function absoluteAssetUrl(url: string | null | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  if (trimmed.startsWith("/backend-files/")) {
    const apiBase =
      process.env.NEXT_PUBLIC_KUMBU_API_URL?.trim().replace(/\/$/, "") ??
      "https://api.kumbu-market.com";
    return `${apiBase}/files${trimmed.slice("/backend-files".length)}`;
  }

  if (trimmed.startsWith("/")) return absoluteSiteUrl(trimmed);
  return trimmed;
}

export const DEFAULT_OG_IMAGE = "/og-image.png";
