import type { CatalogProduct } from "@/types/store";

export const MAX_LISTING_IMAGES = 10;

export function normalizeListingImageUrl(raw: string): string | null {
  let s = raw.trim();
  if (!s) return null;

  if (s.startsWith("/backend-files/")) return s;

  if (/^https?:\/\//i.test(s)) {
    try {
      const parsed = new URL(s);
      if (process.env.NODE_ENV === "development" && parsed.pathname.startsWith("/files/")) {
        const host = parsed.hostname;
        if (
          host === "localhost" ||
          host === "127.0.0.1" ||
          host.startsWith("192.168.") ||
          host.startsWith("10.")
        ) {
          return `/backend-files${parsed.pathname.slice("/files".length)}`;
        }
      }
      return parsed.href;
    } catch {
      return null;
    }
  }

  if (s.startsWith("//")) {
    s = `https:${s}`;
    try {
      return new URL(s).href;
    } catch {
      return null;
    }
  }

  if (s.startsWith("/") || s.startsWith(".")) return null;

  if (/^[\w-]+(\.[\w-]+)+/i.test(s) || s.includes("/")) {
    try {
      return new URL(`https://${s}`).href;
    } catch {
      return null;
    }
  }

  return null;
}

export function normalizeListingImageUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of urls) {
    const n = normalizeListingImageUrl(raw);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out.slice(0, MAX_LISTING_IMAGES);
}

export function parseImageUrls(raw: unknown): string[] {
  let list: unknown[] = [];

  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      return [];
    }
  } else {
    return [];
  }

  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const url =
      typeof item === "string" ? normalizeListingImageUrl(item) : null;
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
    if (out.length >= MAX_LISTING_IMAGES) break;
  }
  return out;
}

export function productImageUrls(product: Pick<CatalogProduct, "imageUrl" | "imageUrls">): string[] {
  const fromList = parseImageUrls(product.imageUrls ?? []);
  const cover = normalizeListingImageUrl(product.imageUrl ?? "") ?? "";
  const seen = new Set(fromList);
  const merged = [...fromList];
  if (cover && !seen.has(cover)) merged.unshift(cover);
  return merged.slice(0, MAX_LISTING_IMAGES);
}

export function productCoverUrl(product: Pick<CatalogProduct, "imageUrl" | "imageUrls">): string | null {
  return productImageUrls(product)[0] ?? null;
}

function schemaErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}

export function isMissingSchemaColumn(err: unknown, column: string): boolean {
  const lower = schemaErrorMessage(err).toLowerCase();
  const col = column.toLowerCase();
  return (
    lower.includes(col) &&
    (lower.includes("schema cache") ||
      lower.includes("could not find") ||
      lower.includes("does not exist") ||
      lower.includes("column"))
  );
}

export function isMissingImageUrlsColumn(err: unknown): boolean {
  return isMissingSchemaColumn(err, "image_urls");
}

export function isMissingUpdatedAtColumn(err: unknown): boolean {
  return isMissingSchemaColumn(err, "updated_at");
}

export function isMissingDeletedAtColumn(err: unknown): boolean {
  return isMissingSchemaColumn(err, "deleted_at");
}
