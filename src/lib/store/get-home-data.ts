import { getCatalogBootstrap } from "@/lib/store/catalog-cache";
import { demoMarketing } from "@/lib/store/demo-data";
import { fetchMarketingBlocksBackend } from "@/lib/kumbu-api/platform";
import type {
  AppMarketingBlock,
  CatalogCategory,
  CatalogProduct,
} from "@/types/store";

export interface HomeData {
  marketing: AppMarketingBlock[];
  categories: CatalogCategory[];
  featured: CatalogProduct[];
  feed: CatalogProduct[];
  isDemo: boolean;
}

export async function getHomeData(): Promise<HomeData> {
  const [bootstrap, marketingRemote] = await Promise.all([
    getCatalogBootstrap(),
    fetchMarketingBlocksBackend(),
  ]);
  const marketing = marketingRemote.length > 0 ? marketingRemote : demoMarketing;
  return {
    marketing,
    categories: bootstrap.categories,
    featured: bootstrap.featured,
    feed: bootstrap.feed,
    isDemo: bootstrap.isDemo,
  };
}
