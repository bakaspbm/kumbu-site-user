/** Links de partilha sociais para um anúncio (cliente). */

export type ListingSharePayload = {
  title: string;
  priceLabel: string;
  location?: string | null;
  /** Path canónico, ex. `/produto/prd_123` — se omitido, usa `window.location.href`. */
  path?: string;
};

export function buildListingShareText(payload: ListingSharePayload): string {
  const location = payload.location?.trim();
  const parts = [payload.title, payload.priceLabel];
  if (location) parts.push(location);
  return `${parts.join(" — ")} · Kumbú`;
}

export function resolveListingShareUrl(path?: string): string {
  if (typeof window === "undefined") return path ?? "";
  if (path?.startsWith("http")) return path;
  if (path?.startsWith("/")) return `${window.location.origin}${path}`;
  return window.location.href;
}

export function listingShareTargets(url: string, text: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const whatsappBody = encodeURIComponent(`${text}\n${url}`);
  return {
    whatsapp: `https://wa.me/?text=${whatsappBody}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
  } as const;
}
