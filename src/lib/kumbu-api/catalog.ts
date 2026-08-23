import type {
  CatalogCategory,
  CatalogProduct,
  CatalogProductInsert,
  CatalogProductUpdate,
  CatalogSearchFilters,
  CatalogSubcategory,
  SellerSummary,
  SortMode,
} from "@/types/store";
import { getKumbuApiClient, type KumbuApiClient, type ApiError, normalizeBackendAssetUrl } from "@/lib/kumbu-api/client";

type CategoryDto = {
  id: string;
  name: string;
  kind?: string | null;
};

type ListingDto = {
  id: string;
  sellerId?: string | null;
  sellerName?: string | null;
  sellerPhotoUrl?: string | null;
  sellerVerified?: boolean | null;
  city?: string | null;
  region?: string | null;
  categoryId?: string | null;
  subcategoryId?: string | null;
  title: string;
  priceLabel?: string | null;
  oldPriceLabel?: string | null;
  discountPercent?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  viewCount?: number | null;
  imageUrls?: string[] | null;
  videoUrl?: string | null;
  videoUrls?: string[] | null;
  description?: string | null;
  deliveryText?: string | null;
  listingKind?: string | null;
  featured?: boolean | null;
  outOfStock?: boolean | null;
  propertyMeta?: Record<string, unknown> | null;
  jobMeta?: Record<string, unknown> | null;
  jobListingStatus?: string | null;
  productMeta?: Record<string, unknown> | null;
};

type PageDto<T> = {
  content?: T[] | null;
  totalPages?: number;
  totalElements?: number;
  page?: number;
};

type UserProfileDto = {
  id: string;
  fullName?: string | null;
  profileImageUrl?: string | null;
  phone?: string | null;
  city?: string | null;
  sellerVerified?: boolean | null;
};

function clientOrThrow(): KumbuApiClient {
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  return client;
}

function isUnauthorized(error: unknown): boolean {
  const err = error as ApiError | undefined;
  return !!err && typeof err.status === "number" && err.status === 401;
}

function toCategory(row: CategoryDto, index: number): CatalogCategory {
  return {
    id: String(row.id),
    name: String(row.name),
    kind: row.kind ?? "product",
    sortOrder: index,
  };
}

function mapImageUrls(urls: string[] | null | undefined): string[] {
  if (!urls?.length) return [];
  return urls.map((u) => normalizeBackendAssetUrl(u) ?? u);
}

function toProduct(row: ListingDto, index: number): CatalogProduct {
  const imageUrls = mapImageUrls(row.imageUrls);
  return {
    id: String(row.id),
    sellerId: String(row.sellerId ?? ""),
    seller: row.sellerId
      ? {
          id: String(row.sellerId),
          displayName: row.sellerName ?? "Utilizador",
          photoUrl: normalizeBackendAssetUrl(row.sellerPhotoUrl),
          city: row.city ?? null,
          sellerVerified: row.sellerVerified === true,
        }
      : null,
    categoryId: String(row.categoryId ?? ""),
    subcategoryId: row.subcategoryId ?? null,
    title: String(row.title ?? ""),
    priceLabel: row.priceLabel ?? "",
    oldPriceLabel: row.oldPriceLabel ?? null,
    discountPercent: row.discountPercent ?? null,
    rating: row.rating ?? null,
    reviewCount: row.reviewCount ?? 0,
    viewCount: row.viewCount ?? 0,
    isOutOfStock: Boolean(row.outOfStock),
    isFeatured: Boolean(row.featured),
    sortOrder: index,
    imageUrls,
    imageUrl: imageUrls[0] ?? null,
    videoUrl: normalizeBackendAssetUrl(row.videoUrl) ?? null,
    videoUrls: (() => {
      const fromList = (row.videoUrls ?? [])
        .map((u) => normalizeBackendAssetUrl(u))
        .filter((u): u is string => Boolean(u));
      if (fromList.length > 0) return fromList.slice(0, 3);
      const single = normalizeBackendAssetUrl(row.videoUrl);
      return single ? [single] : [];
    })(),
    description: row.description ?? null,
    deliveryText: row.deliveryText ?? null,
    listingKind:
      row.listingKind === "property"
        ? "property"
        : row.listingKind === "job"
          ? "job"
          : "general",
    propertyMeta: (row.propertyMeta as CatalogProduct["propertyMeta"]) ?? null,
    jobMeta: (row.jobMeta as CatalogProduct["jobMeta"]) ?? null,
    jobListingStatus: (row.jobListingStatus as CatalogProduct["jobListingStatus"]) ?? "active",
    productMeta: (row.productMeta as CatalogProduct["productMeta"]) ?? null,
  };
}

export function mapListingDtoToProduct(row: ListingDto, index = 0): CatalogProduct {
  return toProduct(row, index);
}

function buildListingQuery(opts: CatalogSearchFilters) {
  return {
    page: opts.page ?? 0,
    size: opts.size ?? 120,
    categoryId: opts.categoryId || undefined,
    subcategoryId: opts.subcategoryId || undefined,
    sellerId: opts.sellerId || undefined,
    q: opts.q?.trim() || undefined,
    featured: opts.featuredOnly || undefined,
    sort: opts.sortMode && opts.sortMode !== "default" ? opts.sortMode : undefined,
    city: opts.city?.trim() || undefined,
    region: opts.region?.trim() || undefined,
    priceMin: opts.priceMin != null && opts.priceMin > 0 ? opts.priceMin : undefined,
    priceMax: opts.priceMax != null && opts.priceMax > 0 ? opts.priceMax : undefined,
    listingKind: opts.listingKind || undefined,
    listingIntent: opts.listingIntent || undefined,
    propertyType: opts.propertyType || undefined,
    condition: opts.condition || undefined,
  };
}

function mapSeller(row: UserProfileDto): SellerSummary {
  return {
    id: String(row.id),
    displayName: row.fullName ?? "Utilizador",
    photoUrl: normalizeBackendAssetUrl(row.profileImageUrl),
    phone: row.phone ?? null,
    city: row.city ?? null,
    sellerVerified: row.sellerVerified === true,
  };
}

export async function listCatalogCategoriesBackend(): Promise<CatalogCategory[]> {
  const client = clientOrThrow();
  const rows = await client.request<CategoryDto[]>("/catalog/categories", { auth: false });
  return (rows ?? []).map(toCategory);
}

export async function listCatalogSubcategoriesBackend(
  categoryId: string,
): Promise<CatalogSubcategory[]> {
  const client = clientOrThrow();
  try {
    const rows = await client.request<
      { categoryId?: string; category_id?: string; id: string; label: string; sortOrder?: number; sort_order?: number }[]
    >(`/catalog/categories/${encodeURIComponent(categoryId)}/subcategories`, {
      auth: false,
    });
    return (rows ?? []).map((row, index) => ({
      id: String(row.id),
      categoryId: String(row.categoryId ?? row.category_id ?? categoryId),
      name: String(row.label),
      sortOrder: Number(row.sortOrder ?? row.sort_order ?? index),
    }));
  } catch {
    return [];
  }
}

export async function listCatalogProductsBackend(opts: {
  categoryId: string;
  subcategoryId?: string;
  sortMode?: SortMode;
  featuredOnly?: boolean;
  city?: string;
  region?: string;
  priceMin?: number;
  priceMax?: number;
  listingIntent?: "sale" | "rent";
  propertyType?: string;
  condition?: string;
}): Promise<CatalogProduct[]> {
  const client = clientOrThrow();
  const page = await client.request<PageDto<ListingDto>>("/catalog/listings", {
    auth: false,
    query: buildListingQuery({
      categoryId: opts.categoryId,
      subcategoryId: opts.subcategoryId,
      sortMode: opts.sortMode,
      featuredOnly: opts.featuredOnly,
      city: opts.city,
      region: opts.region,
      priceMin: opts.priceMin,
      priceMax: opts.priceMax,
      listingIntent: opts.listingIntent,
      propertyType: opts.propertyType,
      condition: opts.condition,
      size: 120,
    }),
  });

  return (page.content ?? []).map(toProduct);
}

export async function searchCatalogListingsBackend(
  filters: CatalogSearchFilters,
): Promise<{ items: CatalogProduct[]; total: number }> {
  const client = clientOrThrow();
  const page = await client.request<PageDto<ListingDto>>("/catalog/listings", {
    auth: false,
    query: buildListingQuery({
      ...filters,
      size: Math.min(Math.max(filters.size ?? 48, 1), 120),
      page: filters.page ?? 0,
    }),
  });
  return {
    items: (page.content ?? []).map(toProduct),
    total: page.totalElements ?? page.content?.length ?? 0,
  };
}

export async function listMarketplaceProductsBackend(opts?: {
  featuredOnly?: boolean;
  limit?: number;
  categoryId?: string;
}): Promise<CatalogProduct[]> {
  const client = clientOrThrow();
  const size = Math.max(1, Math.min(opts?.limit ?? 60, 120));
  const page = await client.request<PageDto<ListingDto>>("/catalog/listings", {
    auth: false,
    query: buildListingQuery({
      categoryId: opts?.categoryId,
      featuredOnly: opts?.featuredOnly,
      size,
    }),
  });
  let rows = (page.content ?? []).map(toProduct).filter((item) => item.listingKind !== "job");
  if (opts?.limit) rows = rows.slice(0, opts.limit);
  return rows;
}

export async function listFeedProductsBackend(limit = 28): Promise<CatalogProduct[]> {
  return listMarketplaceProductsBackend({ limit });
}

export async function getFeaturedProductsBackend(max = 8): Promise<CatalogProduct[]> {
  const client = clientOrThrow();
  const page = await client.request<PageDto<ListingDto>>("/catalog/listings/featured", {
    auth: false,
    query: { page: 0, size: max },
  });
  return (page.content ?? []).map(toProduct).slice(0, max);
}

export async function getCatalogProductBackend(productId: string): Promise<CatalogProduct | null> {
  const client = clientOrThrow();
  try {
    const row = await client.request<ListingDto>(`/catalog/listings/${encodeURIComponent(productId)}`, {
      auth: false,
    });
    return toProduct(row, 0);
  } catch (error) {
    if (isUnauthorized(error)) throw error;
    return null;
  }
}

/** Pagina todos os IDs de anúncios públicos (sitemap / SEO). */
export async function listListingIdsForSitemapBackend(
  maxPages = 50,
): Promise<Array<{ id: string }>> {
  const client = clientOrThrow();
  const ids: Array<{ id: string }> = [];
  const pageSize = 120;
  let page = 0;
  let totalPages = 1;

  while (page < totalPages && page < maxPages) {
    const response = await client.request<PageDto<ListingDto>>("/catalog/listings", {
      auth: false,
      query: buildListingQuery({ page, size: pageSize }),
    });
    const rows = response.content ?? [];
    for (const row of rows) {
      ids.push({ id: String(row.id) });
    }
    totalPages = response.totalPages ?? (rows.length < pageSize ? page + 1 : page + 2);
    if (rows.length === 0) break;
    page += 1;
  }

  return ids;
}

export async function getCatalogProductsByIdsBackend(ids: string[]): Promise<CatalogProduct[]> {
  if (ids.length === 0) return [];
  const loaded = await Promise.all(ids.map((id) => getCatalogProductBackend(id)));
  return loaded.filter((row): row is CatalogProduct => !!row);
}

export async function searchCatalogProductsBackend(
  query: string,
  limit = 24,
): Promise<CatalogProduct[]> {
  const q = query.trim();
  if (!q) return [];
  const result = await searchCatalogListingsBackend({ q, size: limit });
  return result.items.slice(0, limit);
}

export async function listSellerProductsBackend(
  sellerId: string,
  limit = 48,
): Promise<CatalogProduct[]> {
  const client = clientOrThrow();
  const page = await client.request<PageDto<ListingDto>>("/catalog/listings", {
    query: buildListingQuery({ sellerId, size: Math.min(Math.max(limit, 1), 120) }),
  });
  return (page.content ?? []).map(toProduct).slice(0, limit);
}

export async function recordProductViewBackend(
  productId: string,
): Promise<number | null> {
  const client = clientOrThrow();
  try {
    const row = await client.request<{ view_count?: number; viewCount?: number }>(
      `/catalog/listings/${encodeURIComponent(productId)}/view`,
      { method: "POST", auth: false },
    );
    return row.view_count ?? row.viewCount ?? null;
  } catch {
    return null;
  }
}

export async function listMyListingsBackend(status?: "all" | "active" | "inactive"): Promise<CatalogProduct[]> {
  const client = clientOrThrow();
  const query = status && status !== "all" ? { status } : undefined;
  const rows = await client.request<ListingDto[]>("/catalog/my-listings", { query });
  return (rows ?? []).map(toProduct);
}

export async function getListingPriceHistoryBackend(productId: string) {
  const client = clientOrThrow();
  const row = await client.request<{ items?: Array<{
    priceLabel?: string;
    oldPriceLabel?: string | null;
    discountPercent?: number | null;
    changedAt?: string;
  }> }>(
    `/catalog/listings/${encodeURIComponent(productId)}/price-history`,
    { auth: false },
  );
  return (row.items ?? []).map((entry) => ({
    priceLabel: entry.priceLabel ?? "",
    oldPriceLabel: entry.oldPriceLabel ?? null,
    discountPercent: entry.discountPercent ?? null,
    changedAt: entry.changedAt ?? "",
  }));
}

export async function createCatalogProductBackend(
  input: CatalogProductInsert,
): Promise<CatalogProduct> {
  const client = clientOrThrow();
  const row = await client.request<ListingDto>("/catalog/listings", {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      description: input.description ?? null,
      priceLabel: input.priceLabel,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId ?? null,
      listingKind: input.listingKind ?? "general",
      imageUrls: input.imageUrls ?? (input.imageUrl ? [input.imageUrl] : []),
      deliveryText: input.deliveryText ?? null,
      propertyMeta: input.propertyMeta ?? null,
      jobMeta: input.jobMeta ?? null,
      productMeta: input.productMeta ?? null,
    }),
  });
  return toProduct(row, 0);
}

export async function updateCatalogProductBackend(
  productId: string,
  update: CatalogProductUpdate,
): Promise<CatalogProduct> {
  const client = clientOrThrow();
  const body: Record<string, unknown> = {};
  if (update.title !== undefined) body.title = update.title;
  if (update.priceLabel !== undefined) body.priceLabel = update.priceLabel;
  if (update.oldPriceLabel !== undefined) body.oldPriceLabel = update.oldPriceLabel;
  if (update.discountPercent !== undefined) body.discountPercent = update.discountPercent;
  if (update.clearPromotion) body.clearPromotion = true;
  if (update.description !== undefined) body.description = update.description;
  if (update.isOutOfStock !== undefined) body.outOfStock = update.isOutOfStock;
  if (update.imageUrls !== undefined) body.imageUrls = update.imageUrls;
  if (update.videoUrl !== undefined) body.videoUrl = update.videoUrl;
  if (update.videoUrls !== undefined) body.videoUrls = update.videoUrls;
  if (update.clearVideoUrl) body.clearVideoUrl = true;
  if (update.clearVideoUrls) body.clearVideoUrls = true;

  const row = await client.request<ListingDto>(
    `/catalog/listings/${encodeURIComponent(productId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
  return toProduct(row, 0);
}

export async function softDeleteCatalogProductBackend(productId: string): Promise<void> {
  const client = clientOrThrow();
  await client.request<void>(`/catalog/listings/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
}

export async function getPublicSellerBackend(userId: string): Promise<SellerSummary | null> {
  const client = clientOrThrow();
  try {
    const row = await client.request<UserProfileDto>(`/users/${encodeURIComponent(userId)}`, {
      auth: false,
    });
    return mapSeller(row);
  } catch (error) {
    if (isUnauthorized(error)) throw error;
    return null;
  }
}
