import type { CatalogProduct } from "@/types/store";

export function hasListingRating(product: CatalogProduct): boolean {
  return (
    (product.reviewCount ?? 0) > 0 &&
    product.rating != null &&
    !Number.isNaN(product.rating)
  );
}

export function formatListingRating(product: CatalogProduct): string | null {
  if (!hasListingRating(product)) return null;
  const n = product.reviewCount ?? 0;
  const suffix = n === 1 ? "1 avaliação" : `${n} avaliações`;
  return `${product.rating!.toFixed(1)} · ${suffix}`;
}

export function formatViewCount(count: number | null | undefined): string | null {
  if (count == null || count <= 0) return null;
  if (count === 1) return "1 visualização";
  return `${count.toLocaleString("pt-PT")} visualizações`;
}
