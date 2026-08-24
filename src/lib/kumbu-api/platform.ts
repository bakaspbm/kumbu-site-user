import { getKumbuApiClient, type KumbuApiClient } from "@/lib/kumbu-api/client";
import type { AppMarketingBlock, HomeBannerSlide } from "@/types/store";

function clientOrThrow(): KumbuApiClient {
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  return client;
}

type MarketingBlockDto = {
  id: string;
  kind?: string | null;
  title?: string | null;
  subtitle?: string | null;
  gradient_from?: string | null;
  gradient_to?: string | null;
  gradientFrom?: string | null;
  gradientTo?: string | null;
  sort_order?: number | null;
  sortOrder?: number | null;
  active?: boolean | null;
  badge?: string | null;
  cta_label?: string | null;
  ctaLabel?: string | null;
  cta_href?: string | null;
  ctaHref?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
  category_id?: string | null;
  categoryId?: string | null;
  search_query?: string | null;
  searchQuery?: string | null;
  starts_at?: string | null;
  startsAt?: string | null;
  ends_at?: string | null;
  endsAt?: string | null;
  show_brand_points?: boolean | null;
  showBrandPoints?: boolean | null;
  source?: string | null;
};

function mapMarketingBlock(row: MarketingBlockDto, index = 0): AppMarketingBlock {
  return {
    id: String(row.id),
    kind: String(row.kind ?? "banner"),
    title: row.title ?? null,
    subtitle: row.subtitle ?? null,
    gradientFrom: row.gradientFrom ?? row.gradient_from ?? null,
    gradientTo: row.gradientTo ?? row.gradient_to ?? null,
    sortOrder: Number(row.sortOrder ?? row.sort_order ?? index),
    active: row.active !== false,
    badge: row.badge ?? null,
    ctaLabel: row.ctaLabel ?? row.cta_label ?? null,
    ctaHref: row.ctaHref ?? row.cta_href ?? null,
    imageUrl: row.imageUrl ?? row.image_url ?? null,
    categoryId: row.categoryId ?? row.category_id ?? null,
    searchQuery: row.searchQuery ?? row.search_query ?? null,
    startsAt: row.startsAt ?? row.starts_at ?? null,
    endsAt: row.endsAt ?? row.ends_at ?? null,
    showBrandPoints: row.showBrandPoints ?? row.show_brand_points ?? true,
    source: row.source ?? undefined,
  };
}

export async function fetchMarketingBlocksBackend(): Promise<AppMarketingBlock[]> {
  const client = getKumbuApiClient();
  if (!client) return [];
  try {
    const rows = await client.request<MarketingBlockDto[]>("/platform/marketing-blocks", {
      auth: false,
    });
    return (rows ?? []).map(mapMarketingBlock);
  } catch {
    return [];
  }
}

export async function fetchHomeBannersBackend(): Promise<HomeBannerSlide[]> {
  const client = getKumbuApiClient();
  if (!client) return [];
  try {
    const row = await client.request<{ banners?: MarketingBlockDto[] }>(
      "/platform/home-banners",
      { auth: false },
    );
    return (row?.banners ?? []).map(mapMarketingBlock);
  } catch {
    return [];
  }
}

export async function fetchLegalDocumentBackend(slug: string): Promise<{
  title: string;
  intro?: string | null;
  sections: { title: string; paragraphs: string[] }[];
  updatedAt?: string | null;
} | null> {
  const client = getKumbuApiClient();
  if (!client) return null;
  try {
    const row = await client.request<Record<string, unknown>>(
      `/platform/legal/${encodeURIComponent(slug)}`,
      { auth: false },
    );
    const sections = Array.isArray(row.sections)
      ? (row.sections as Record<string, unknown>[]).map((section) => {
          const title = String(section.title ?? section.heading ?? "");
          const paragraphs = Array.isArray(section.paragraphs)
            ? section.paragraphs.map((p) => String(p))
            : section.body != null
              ? [String(section.body)]
              : section.content != null
                ? [String(section.content)]
                : [];
          return { title, paragraphs };
        })
      : [];
    return {
      title: String(row.title ?? ""),
      intro: row.intro != null ? String(row.intro) : null,
      sections,
      updatedAt:
        row.updated_at != null
          ? String(row.updated_at)
          : row.updatedAt != null
            ? String(row.updatedAt)
            : null,
    };
  } catch {
    return null;
  }
}

export async function fetchSortFiltersBackend(): Promise<
  { id: string; label: string; sortMode: string; sortOrder: number }[]
> {
  const client = clientOrThrow();
  const rows = await client.request<Record<string, unknown>[]>("/platform/sort-filters", {
    auth: false,
  });
  return (rows ?? []).map((row, index) => ({
    id: String(row.id),
    label: String(row.label ?? ""),
    sortMode: String(row.sort_mode ?? row.sortMode ?? "default"),
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? index),
  }));
}
