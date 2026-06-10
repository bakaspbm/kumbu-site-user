import { unstable_cache } from "next/cache";
import {
  demoCategories,
  demoProducts,
} from "@/lib/store/demo-data";
import {
  getCatalogProduct,
  getFeaturedProducts,
  getPublicSeller,
  listCatalogCategories,
  listCatalogProducts,
  listCatalogSubcategories,
  listFeedProducts,
  listSellerProducts,
} from "@/lib/site-data";
import type {
  CatalogCategory,
  CatalogProduct,
  SellerSummary,
  SortMode,
} from "@/types/store";

export interface CatalogBootstrap {
  categories: CatalogCategory[];
  featured: CatalogProduct[];
  feed: CatalogProduct[];
  isDemo: boolean;
  fetchedAt: number;
}

const REVALIDATE_SEC = 30;

async function fetchCatalogBootstrap(): Promise<CatalogBootstrap> {
  try {
    const [categories, feed, featured] = await Promise.all([
      listCatalogCategories(),
      listFeedProducts(28),
      getFeaturedProducts([], 5),
    ]);
    return {
      categories,
      featured,
      feed,
      isDemo: false,
      fetchedAt: Date.now(),
    };
  } catch {
    return {
      categories: demoCategories,
      featured: demoProducts.slice(0, 5),
      feed: demoProducts,
      isDemo: true,
      fetchedAt: Date.now(),
    };
  }
}

export const getCatalogBootstrap = unstable_cache(
  fetchCatalogBootstrap,
  ["kumbu-catalog-bootstrap"],
  { revalidate: REVALIDATE_SEC, tags: ["catalog-bootstrap"] },
);

async function fetchProduct(id: string): Promise<CatalogProduct | null> {
  try {
    return await getCatalogProduct(id);
  } catch {
    return demoProducts.find((p) => p.id === id) ?? null;
  }
}

export function getCachedProduct(id: string) {
  return unstable_cache(
    () => fetchProduct(id),
    ["kumbu-product", id],
    { revalidate: REVALIDATE_SEC },
  )();
}

export interface CategoryPageData {
  products: CatalogProduct[];
  subcategories: { id: string; name: string }[];
}

async function fetchCategoryPage(
  categoryId: string,
  subcategoryId: string | undefined,
  sortMode: SortMode,
): Promise<CategoryPageData> {
  const fallback = demoProducts.filter((p) => p.categoryId === categoryId);
  try {
    const subs = await listCatalogSubcategories(categoryId);
    const products = await listCatalogProducts({
      categoryId,
      subcategoryId,
      sortMode,
    });
    return {
      products,
      subcategories: subs.map((s) => ({ id: s.id, name: s.name })),
    };
  } catch {
    return { products: fallback, subcategories: [] };
  }
}

export function getCachedCategoryPage(
  categoryId: string,
  subcategoryId: string | undefined,
  sortMode: SortMode,
) {
  return unstable_cache(
    () => fetchCategoryPage(categoryId, subcategoryId, sortMode),
    ["kumbu-category", categoryId, subcategoryId ?? "", sortMode],
    { revalidate: REVALIDATE_SEC },
  )();
}

export interface SellerPageData {
  seller: SellerSummary | null;
  listings: CatalogProduct[];
}

async function fetchSellerPage(sellerId: string): Promise<SellerPageData> {
  try {
    const seller = await getPublicSeller(sellerId);
    const listings = await listSellerProducts(sellerId, 48);
    return { seller, listings };
  } catch {
    return { seller: null, listings: [] };
  }
}

export function getCachedSellerPage(sellerId: string) {
  return unstable_cache(
    () => fetchSellerPage(sellerId),
    ["kumbu-seller", sellerId],
    { revalidate: REVALIDATE_SEC },
  )();
}
