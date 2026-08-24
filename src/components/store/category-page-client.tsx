"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { BackHeader } from "@/components/layout/back-header";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { ProductCard } from "@/components/store/product-card";
import {
  CatalogFiltersPanel,
  EMPTY_CATALOG_FILTERS,
  parsePriceFilter,
  type CatalogFilterState,
} from "@/components/store/catalog-filters-panel";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { useOfflineCategory } from "@/hooks/use-offline-category";
import {
  localizeCategoryName,
  localizeSubcategoryName,
} from "@/lib/catalog/localize-catalog";
import { isJobCategory, isJobCategoryId } from "@/lib/jobs/category";
import { isPropertyCategory, isPropertyCategoryId } from "@/lib/property/category";
import { demoCategories } from "@/lib/store/demo-data";
import type { CatalogCategory, SortMode } from "@/types/store";
import { cn } from "@/lib/utils";

interface CategoryPageClientProps {
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
}

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

export function CategoryPageClient({
  categoryId,
  categoryName,
  subcategoryId,
}: CategoryPageClientProps) {
  const t = useTranslations("catalog");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CatalogFilterState>(() =>
    filtersFromParams(searchParams),
  );

  const categoryMeta = demoCategories.find((c) => c.id === categoryId);
  const isJobBrowse = isJobCategory(categoryMeta) || isJobCategoryId(categoryId);
  const isPropertyBrowse =
    isPropertyCategory(categoryMeta) || isPropertyCategoryId(categoryId);
  const categoryForFilters: CatalogCategory = categoryMeta ?? {
    id: categoryId,
    name: categoryName,
    kind: isJobBrowse ? "job" : isPropertyBrowse ? "stay" : "product",
    sortOrder: 0,
  };

  const apiFilters = useMemo(
    () => ({
      region: filters.region || undefined,
      city: filters.city || undefined,
      priceMin: parsePriceFilter(filters.priceMin),
      priceMax: parsePriceFilter(filters.priceMax),
      listingIntent: filters.listingIntent || undefined,
      propertyType: filters.propertyType || undefined,
      condition: filters.condition || undefined,
    }),
    [filters],
  );

  const { products, subcategories, loading } = useOfflineCategory({
    categoryId,
    subcategoryId,
    sortMode: filters.sortMode,
    filters: apiFilters,
  });

  const displayName = localizeCategoryName(
    categoryMeta ?? { id: categoryId, name: categoryName },
    t,
  );
  const showSubcategories =
    subcategories.length > 0 && !isPropertyBrowse && !isJobBrowse;

  const syncUrl = useCallback(
    (nextFilters: CatalogFilterState, nextSub?: string | null) => {
      const params = new URLSearchParams();
      params.set("name", displayName);
      const sub = nextSub === undefined ? subcategoryId : nextSub || undefined;
      if (sub) params.set("sub", sub);
      if (nextFilters.region) params.set("region", nextFilters.region);
      if (nextFilters.city) params.set("city", nextFilters.city);
      if (nextFilters.priceMin) params.set("priceMin", nextFilters.priceMin);
      if (nextFilters.priceMax) params.set("priceMax", nextFilters.priceMax);
      if (nextFilters.sortMode && nextFilters.sortMode !== "default") {
        params.set("sort", nextFilters.sortMode);
      }
      if (nextFilters.listingIntent) params.set("intent", nextFilters.listingIntent);
      if (nextFilters.propertyType) params.set("ptype", nextFilters.propertyType);
      if (nextFilters.condition) params.set("condition", nextFilters.condition);
      router.replace(`/store-category/${categoryId}?${params.toString()}`, {
        scroll: false,
      });
    },
    [categoryId, displayName, router, subcategoryId],
  );

  function emptyCategoryMessage(): string {
    if (isJobBrowse) return t("emptyJobs");
    if (isPropertyBrowse) return t("emptyProperty");
    if (categoryId === "servicos") return t("emptyServices");
    return t("emptyDefault");
  }

  if (loading) return <PageSkeleton />;

  return (
    <article className="min-h-full pb-8">
      <OfflineBanner />
      <BackHeader title={displayName} />

      {showSubcategories && (
        <nav
          className="kumbu-container border-b border-kumbu-border py-3"
          aria-label={t("subcategoriesAria")}
        >
          <p className="flex gap-2 overflow-x-auto scrollbar-none">
            <Link
              href={`/store-category/${categoryId}?name=${encodeURIComponent(displayName)}`}
              prefetch
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors",
                !subcategoryId
                  ? "bg-kumbu-primary text-white shadow-sm"
                  : "bg-kumbu-secondary text-kumbu-muted hover:text-kumbu-foreground",
              )}
            >
              {tCommon("all")}
            </Link>
            {subcategories.map((s) => (
              <Link
                key={s.id}
                href={`/store-category/${categoryId}?name=${encodeURIComponent(displayName)}&sub=${s.id}`}
                prefetch
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors",
                  subcategoryId === s.id
                    ? "bg-kumbu-primary text-white shadow-sm"
                    : "bg-kumbu-secondary text-kumbu-muted hover:text-kumbu-foreground",
                )}
              >
                {localizeSubcategoryName(categoryId, s, t)}
              </Link>
            ))}
          </p>
        </nav>
      )}

      <div className="kumbu-container mt-4">
        <CatalogFiltersPanel
          value={filters}
          category={categoryForFilters}
          compact
          onChange={(patch) => {
            setFilters((prev) => {
              const next = { ...prev, ...patch };
              syncUrl(next);
              return next;
            });
          }}
          onClear={() => {
            setFilters(EMPTY_CATALOG_FILTERS);
            syncUrl(EMPTY_CATALOG_FILTERS);
          }}
        />
      </div>

      <ul className="kumbu-listing-grid kumbu-container mt-6">
        {products.length === 0 ? (
          <li className="col-span-full kumbu-card py-16 text-center text-sm text-kumbu-muted">
            {emptyCategoryMessage()}
          </li>
        ) : (
          products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} variant="grid" />
            </li>
          ))
        )}
      </ul>
    </article>
  );
}
