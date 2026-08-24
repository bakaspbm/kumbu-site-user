"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { BackHeader } from "@/components/layout/back-header";
import { ListingCard } from "@/components/store/listing-card";
import {
  CatalogFiltersPanel,
  EMPTY_CATALOG_FILTERS,
  parsePriceFilter,
  type CatalogFilterState,
} from "@/components/store/catalog-filters-panel";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { localizeCategoryName } from "@/lib/catalog/localize-catalog";
import { isJobCategory } from "@/lib/jobs/category";
import { listCatalogCategories, searchCatalogListings } from "@/lib/site-data";
import type { CatalogCategory, CatalogProduct, SortMode } from "@/types/store";

function filtersFromParams(params: URLSearchParams): CatalogFilterState {
  const sort = params.get("sort") as SortMode | null;
  return {
    region: params.get("region") ?? "",
    city: params.get("city") ?? "",
    priceMin: params.get("priceMin") ?? "",
    priceMax: params.get("priceMax") ?? "",
    sortMode:
      sort === "newest" ||
      sort === "price_asc" ||
      sort === "price_desc" ||
      sort === "rating_desc"
        ? sort
        : "default",
    listingIntent:
      params.get("intent") === "sale"
        ? "sale"
        : params.get("intent") === "rent"
          ? "rent"
          : "",
    propertyType: (params.get("ptype") as CatalogFilterState["propertyType"]) || "",
    condition: params.get("condition") ?? "",
  };
}

export function ProcurarClient() {
  const t = useTranslations("search");
  const tCommon = useTranslations("common");
  const tCatalog = useTranslations("catalog");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputQuery, setInputQuery] = useState(searchParams.get("q") ?? "");
  const [activeQuery, setActiveQuery] = useState(searchParams.get("q") ?? "");
  const [categoryId, setCategoryId] = useState(searchParams.get("cat") ?? "");
  const [filters, setFilters] = useState<CatalogFilterState>(() =>
    filtersFromParams(searchParams),
  );
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [results, setResults] = useState<CatalogProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId],
  );
  const isJobsSelected = Boolean(
    selectedCategory && isJobCategory(selectedCategory),
  );

  const syncUrl = useCallback(
    (next: {
      q?: string;
      cat?: string;
      filters?: CatalogFilterState;
    }) => {
      const params = new URLSearchParams();
      const q = (next.q ?? activeQuery).trim();
      const cat = next.cat ?? categoryId;
      const f = next.filters ?? filters;
      if (q) params.set("q", q);
      if (cat) params.set("cat", cat);
      if (f.region) params.set("region", f.region);
      if (f.city) params.set("city", f.city);
      if (f.priceMin) params.set("priceMin", f.priceMin);
      if (f.priceMax) params.set("priceMax", f.priceMax);
      if (f.sortMode && f.sortMode !== "default") params.set("sort", f.sortMode);
      if (f.listingIntent) params.set("intent", f.listingIntent);
      if (f.propertyType) params.set("ptype", f.propertyType);
      if (f.condition) params.set("condition", f.condition);
      const qs = params.toString();
      router.replace(qs ? `/procurar?${qs}` : "/procurar", { scroll: false });
    },
    [activeQuery, categoryId, filters, router],
  );

  useEffect(() => {
    void listCatalogCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const response = await searchCatalogListings({
          q: activeQuery.trim() || undefined,
          categoryId: categoryId || undefined,
          region: filters.region || undefined,
          city: filters.city || undefined,
          priceMin: isJobsSelected ? undefined : parsePriceFilter(filters.priceMin),
          priceMax: isJobsSelected ? undefined : parsePriceFilter(filters.priceMax),
          sortMode:
            isJobsSelected &&
            (filters.sortMode === "price_asc" || filters.sortMode === "price_desc")
              ? "default"
              : filters.sortMode,
          listingIntent: isJobsSelected ? undefined : filters.listingIntent || undefined,
          propertyType: isJobsSelected ? undefined : filters.propertyType || undefined,
          condition: isJobsSelected ? undefined : filters.condition || undefined,
          size: 48,
        });
        if (!cancelled) {
          setResults(response.items);
          setTotal(response.total);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeQuery, categoryId, filters, isJobsSelected]);

  function submitSearch() {
    const q = inputQuery.trim();
    setActiveQuery(q);
    syncUrl({ q });
  }

  if (loading && results.length === 0 && categories.length === 0) {
    return (
      <article>
        <BackHeader title={t("title")} />
        <PageSkeleton />
      </article>
    );
  }

  return (
    <article>
      <BackHeader title={t("title")} />
      <div className="kumbu-container space-y-4 py-4">
        <div className="kumbu-search-field">
          <Search className="size-4 text-kumbu-muted" aria-hidden />
          <input
            type="search"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitSearch()}
            placeholder={t("placeholder")}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <button
            type="button"
            onClick={submitSearch}
            className="rounded-lg bg-kumbu-primary px-3 py-1.5 text-xs font-bold text-white"
          >
            {tCommon("search")}
          </button>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setCategoryId("");
                setFilters((prev) => ({
                  ...prev,
                  listingIntent: "",
                  propertyType: "",
                  condition: "",
                }));
                syncUrl({
                  cat: "",
                  filters: {
                    ...filters,
                    listingIntent: "",
                    propertyType: "",
                    condition: "",
                  },
                });
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                !categoryId
                  ? "bg-kumbu-primary text-white"
                  : "bg-kumbu-surface text-kumbu-muted"
              }`}
            >
              {tCommon("all")}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategoryId(c.id);
                  const jobs = isJobCategory(c);
                  const next = {
                    ...filters,
                    listingIntent: "" as const,
                    propertyType: "" as const,
                    condition: "",
                    ...(jobs
                      ? {
                          priceMin: "",
                          priceMax: "",
                          sortMode:
                            filters.sortMode === "price_asc" ||
                            filters.sortMode === "price_desc"
                              ? ("default" as const)
                              : filters.sortMode,
                        }
                      : {}),
                  };
                  setFilters(next);
                  syncUrl({ cat: c.id, filters: next });
                }}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                  categoryId === c.id
                    ? "bg-kumbu-primary text-white"
                    : "bg-kumbu-surface text-kumbu-muted"
                }`}
              >
                {localizeCategoryName(c, tCatalog)}
              </button>
            ))}
          </div>
        )}

        <CatalogFiltersPanel
          value={filters}
          category={selectedCategory}
          onChange={(patch) => {
            setFilters((prev) => {
              const next = { ...prev, ...patch };
              syncUrl({ filters: next });
              return next;
            });
          }}
          onClear={() => {
            setFilters(EMPTY_CATALOG_FILTERS);
            syncUrl({ filters: EMPTY_CATALOG_FILTERS });
          }}
        />

        <p className="text-sm text-kumbu-muted">
          {loading ? t("searchingProducts") : t("listingCount", { count: total })}
        </p>

        {results.length === 0 && !loading ? (
          <EmptyState
            icon={Search}
            title={activeQuery.trim() ? t("noResultsTitle") : t("noResultsTitleBrowse")}
            description={
              activeQuery.trim()
                ? t("noResultsFor", { query: activeQuery.trim() })
                : t("noResults")
            }
            actionHref="/publicar"
            actionLabel={t("noResultsPublish")}
          />
        ) : (
          <ul className="kumbu-listing-grid">
            {results.map((p) => (
              <li key={p.id}>
                <ListingCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
