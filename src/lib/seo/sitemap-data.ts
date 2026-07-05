import { getCategoryExploreHref } from "@/lib/catalog/category-links";
import { listCatalogCategoriesBackend, listListingIdsForSitemapBackend } from "@/lib/kumbu-api/catalog";
import { absoluteSiteUrl } from "@/lib/seo/site-url";
import type { MetadataRoute } from "next";

const STATIC_PUBLIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/categorias", changeFrequency: "daily", priority: 0.9 },
  { path: "/procurar", changeFrequency: "weekly", priority: 0.8 },
  { path: "/emprego", changeFrequency: "daily", priority: 0.85 },
  { path: "/como-funciona", changeFrequency: "monthly", priority: 0.5 },
  { path: "/termos", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacidade", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
  { path: "/regras-publicacao", changeFrequency: "monthly", priority: 0.4 },
  { path: "/support", changeFrequency: "monthly", priority: 0.4 },
];

function staticEntries(): MetadataRoute.Sitemap {
  return STATIC_PUBLIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: absoluteSiteUrl(path),
    changeFrequency,
    priority,
  }));
}

/** Sitemap mínimo — usado se a API falhar (evita 500 no Google Search Console). */
export function buildStaticSitemapEntries(): MetadataRoute.Sitemap {
  return staticEntries();
}

export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = staticEntries();

  try {
    const categories = await listCatalogCategoriesBackend();
    for (const category of categories) {
      const href = getCategoryExploreHref(category);
      entries.push({
        url: absoluteSiteUrl(href),
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  } catch {
    /* API indisponível — mantém rotas estáticas */
  }

  try {
    const listingIds = await listListingIdsForSitemapBackend(10);
    for (const { id } of listingIds) {
      entries.push({
        url: absoluteSiteUrl(`/produto/${id}`),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    /* sem anúncios indexáveis */
  }

  return entries;
}
