import type { CatalogBootstrap } from "@/lib/store/catalog-cache";
import type {
  CatalogCategory,
  CatalogProduct,
  SellerSummary,
  SortMode,
  StoreUser,
} from "@/types/store";
import { idbGet, idbSet } from "./idb";

const ONLINE_TTL_MS = 45_000;
const OFFLINE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function isBrowserOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function shouldRevalidate(fetchedAt: number): boolean {
  if (!isBrowserOnline()) {
    return Date.now() - fetchedAt > OFFLINE_MAX_AGE_MS;
  }
  return Date.now() - fetchedAt > ONLINE_TTL_MS;
}

export async function getOfflineBootstrap(): Promise<CatalogBootstrap | null> {
  const data = await idbGet<CatalogBootstrap>("bootstrap");
  if (!data?.fetchedAt) return null;
  if (!isBrowserOnline() && Date.now() - data.fetchedAt > OFFLINE_MAX_AGE_MS) {
    return null;
  }
  return data;
}

export async function setOfflineBootstrap(data: CatalogBootstrap): Promise<void> {
  await idbSet("bootstrap", data);
  await cacheProducts([...data.feed, ...data.featured]);
}

export async function getOfflineProduct(
  id: string,
): Promise<CatalogProduct | null> {
  return (await idbGet<CatalogProduct>(`product:${id}`)) ?? null;
}

export async function cacheProducts(products: CatalogProduct[]): Promise<void> {
  await Promise.all(
    products.map((p) => idbSet(`product:${p.id}`, p)),
  );
}

export async function setOfflineProduct(product: CatalogProduct): Promise<void> {
  await idbSet(`product:${product.id}`, product);
}

export interface CategoryCacheEntry {
  categoryId: string;
  subcategoryId?: string;
  sortMode: SortMode;
  products: CatalogProduct[];
  subcategories: { id: string; name: string }[];
  fetchedAt: number;
}

function categoryKey(
  categoryId: string,
  subcategoryId?: string,
  sortMode: SortMode = "default",
) {
  return `category:${categoryId}:${subcategoryId ?? ""}:${sortMode}`;
}

export async function getOfflineCategory(
  categoryId: string,
  subcategoryId?: string,
  sortMode: SortMode = "default",
): Promise<CategoryCacheEntry | null> {
  const data = await idbGet<CategoryCacheEntry>(
    categoryKey(categoryId, subcategoryId, sortMode),
  );
  if (!data?.fetchedAt) return null;
  if (!isBrowserOnline() && Date.now() - data.fetchedAt > OFFLINE_MAX_AGE_MS) {
    return null;
  }
  return data;
}

export async function setOfflineCategory(entry: CategoryCacheEntry): Promise<void> {
  const key = categoryKey(
    entry.categoryId,
    entry.subcategoryId,
    entry.sortMode,
  );
  await idbSet(key, entry);
  await cacheProducts(entry.products);
}

export interface SellerCacheEntry {
  seller: SellerSummary;
  listings: CatalogProduct[];
  fetchedAt: number;
}

export async function getOfflineSeller(
  sellerId: string,
): Promise<SellerCacheEntry | null> {
  const data = await idbGet<SellerCacheEntry>(`seller:${sellerId}`);
  if (!data?.fetchedAt) return null;
  if (!isBrowserOnline() && Date.now() - data.fetchedAt > OFFLINE_MAX_AGE_MS) {
    return null;
  }
  return data;
}

export async function setOfflineSeller(entry: SellerCacheEntry): Promise<void> {
  await idbSet(`seller:${entry.seller.id}`, entry);
  await cacheProducts(entry.listings);
}

export async function getOfflineMyListings(
  userId: string,
): Promise<CatalogProduct[] | null> {
  const data = await idbGet<{ listings: CatalogProduct[]; fetchedAt: number }>(
    `my-listings:${userId}`,
  );
  if (!data?.fetchedAt) return null;
  if (!isBrowserOnline() && Date.now() - data.fetchedAt > OFFLINE_MAX_AGE_MS) {
    return null;
  }
  return data.listings;
}

export async function setOfflineMyListings(
  userId: string,
  listings: CatalogProduct[],
): Promise<void> {
  await idbSet(`my-listings:${userId}`, {
    listings,
    fetchedAt: Date.now(),
  });
  await cacheProducts(listings);
}

export async function getOfflineStoreUser(
  userId: string,
): Promise<StoreUser | null> {
  const data = await idbGet<{ user: StoreUser; fetchedAt: number }>(
    `profile:${userId}`,
  );
  if (!data?.user) return null;
  if (!isBrowserOnline() && Date.now() - data.fetchedAt > OFFLINE_MAX_AGE_MS) {
    return null;
  }
  return data.user;
}

export async function setOfflineStoreUser(
  userId: string,
  user: StoreUser,
): Promise<void> {
  await idbSet(`profile:${userId}`, { user, fetchedAt: Date.now() });
}

export async function getOfflineProductsByIds(
  ids: string[],
): Promise<CatalogProduct[]> {
  const out: CatalogProduct[] = [];
  for (const id of ids) {
    const p = await getOfflineProduct(id);
    if (p) out.push(p);
  }
  const order = new Map(ids.map((id, i) => [id, i]));
  out.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  return out;
}

export type { CatalogCategory };
