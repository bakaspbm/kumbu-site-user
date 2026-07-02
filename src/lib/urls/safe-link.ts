/**
 * Valida URLs externas ou de API antes de renderizar links.
 */
export function isSafeAppLink(href: string | null | undefined): boolean {
  if (!href?.trim()) return false;
  const value = href.trim();
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    const apiUrl = process.env.NEXT_PUBLIC_KUMBU_API_URL?.trim();
    if (apiUrl) {
      const api = new URL(apiUrl);
      if (parsed.origin === api.origin) return true;
    }
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (siteUrl) {
      const site = new URL(siteUrl);
      if (parsed.origin === site.origin) return true;
    }
    if (
      parsed.hostname === "kumbu-market.com" ||
      parsed.hostname === "www.kumbu-market.com"
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function sanitizeAppLink(href: string | null | undefined): string | null {
  return isSafeAppLink(href) ? href!.trim() : null;
}
