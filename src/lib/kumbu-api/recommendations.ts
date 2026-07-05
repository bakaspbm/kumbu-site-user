import type { CatalogProduct } from "@/types/store";
import { getKumbuApiClient, normalizeBackendAssetUrl } from "@/lib/kumbu-api/client";

type ListingDto = {
  id: string;
  sellerId?: string | null;
  sellerName?: string | null;
  sellerPhotoUrl?: string | null;
  categoryId?: string | null;
  title: string;
  priceLabel?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  imageUrls?: string[] | null;
  description?: string | null;
  listingKind?: string | null;
  featured?: boolean | null;
  outOfStock?: boolean | null;
  city?: string | null;
  region?: string | null;
};

type RecommendationItemDto = {
  listing?: ListingDto | null;
  reason?: string | null;
  reasonLabel?: string | null;
  score?: number | null;
};

type HomeRecommendationsDto = {
  for_you?: RecommendationItemDto[] | null;
  trending?: RecommendationItemDto[] | null;
  new_nearby?: RecommendationItemDto[] | null;
  nearby?: RecommendationItemDto[] | null;
  recently_viewed?: RecommendationItemDto[] | null;
};

function toProduct(row: ListingDto, index: number): CatalogProduct {
  const imageUrls = (row.imageUrls ?? []).map((u) => normalizeBackendAssetUrl(u) ?? u);
  return {
    id: String(row.id),
    sellerId: String(row.sellerId ?? ""),
    seller: row.sellerId
      ? {
          id: String(row.sellerId),
          displayName: row.sellerName ?? "Utilizador",
          photoUrl: normalizeBackendAssetUrl(row.sellerPhotoUrl),
          city: row.city ?? null,
        }
      : null,
    categoryId: String(row.categoryId ?? ""),
    subcategoryId: null,
    title: String(row.title ?? ""),
    priceLabel: row.priceLabel ?? "",
    rating: row.rating ?? null,
    reviewCount: row.reviewCount ?? 0,
    isOutOfStock: Boolean(row.outOfStock),
    isFeatured: Boolean(row.featured),
    sortOrder: index,
    imageUrls,
    imageUrl: imageUrls[0] ?? null,
    description: row.description ?? null,
    listingKind:
      row.listingKind === "property"
        ? "property"
        : row.listingKind === "job"
          ? "job"
          : "general",
  };
}

function mapItems(items: RecommendationItemDto[] | null | undefined): CatalogProduct[] {
  return (items ?? [])
    .map((item) => item.listing)
    .filter((l): l is ListingDto => Boolean(l))
    .map(toProduct);
}

export type HomeRecommendations = {
  forYou: CatalogProduct[];
  trending: CatalogProduct[];
  newNearby: CatalogProduct[];
  nearby: CatalogProduct[];
};

export async function getHomeRecommendationsBackend(limit = 12): Promise<HomeRecommendations> {
  const client = getKumbuApiClient();
  if (!client) {
    return { forYou: [], trending: [], newNearby: [], nearby: [] };
  }
  const data = await client.request<HomeRecommendationsDto>("/recommendations/home", {
    auth: false,
    query: { limit },
  });
  return {
    forYou: mapItems(data.for_you),
    trending: mapItems(data.trending),
    newNearby: mapItems(data.new_nearby),
    nearby: mapItems(data.nearby),
  };
}

export async function getSimilarProductsBackend(
  productId: string,
  limit = 8,
): Promise<CatalogProduct[]> {
  const client = getKumbuApiClient();
  if (!client) return [];
  const rows = await client.request<RecommendationItemDto[]>(
    `/recommendations/similar/${encodeURIComponent(productId)}`,
    { auth: false, query: { limit } },
  );
  return mapItems(rows);
}
