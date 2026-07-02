import { demoCategories, demoProducts } from "@/lib/store/demo-data";
import type { CatalogBootstrap } from "@/lib/store/catalog-cache";

export function isDevCatalogDemo(): boolean {
  return process.env.NODE_ENV === "development";
}

export function emptyCatalogBootstrap(): CatalogBootstrap {
  return {
    categories: [],
    featured: [],
    feed: [],
    isDemo: false,
    fetchedAt: Date.now(),
  };
}

export function demoCatalogBootstrap(): CatalogBootstrap {
  return {
    categories: demoCategories,
    featured: demoProducts.slice(0, 5),
    feed: demoProducts,
    isDemo: true,
    fetchedAt: Date.now(),
  };
}

export function initialCatalogBootstrap(): CatalogBootstrap {
  return isDevCatalogDemo() ? demoCatalogBootstrap() : emptyCatalogBootstrap();
}
