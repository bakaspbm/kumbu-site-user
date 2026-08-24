"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { onCatalogRefresh } from "@/lib/catalog-refresh";
import { DEMO_SUBCATEGORIES } from "@/lib/catalog/demo-subcategories";
import { demoProducts } from "@/lib/store/demo-data";
import { listCatalogProducts, listCatalogSubcategories } from "@/lib/site-data";
import {
  getOfflineCategory,
  isBrowserOnline,
  setOfflineCategory,
} from "@/lib/offline/store";
import type { CatalogProduct, SortMode } from "@/types/store";

export type CategoryListFilters = {
  city?: string;
  region?: string;
  priceMin?: number;
  priceMax?: number;
  listingIntent?: "sale" | "rent";
  propertyType?: string;
  condition?: string;
};

interface UseOfflineCategoryOpts {
  categoryId: string;
  subcategoryId?: string;
  sortMode?: SortMode;
  filters?: CategoryListFilters;
}

export function useOfflineCategory({
  categoryId,
  subcategoryId,
  sortMode = "default",
  filters = {},
}: UseOfflineCategoryOpts) {
  const fallback = useMemo(
    () => demoProducts.filter((p) => p.categoryId === categoryId),
    [categoryId],
  );
  const [products, setProducts] = useState<CatalogProduct[]>(fallback);
  const [subcategories, setSubcategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const filterKey = useMemo(
    () =>
      [
        filters.region ?? "",
        filters.city ?? "",
        filters.priceMin ?? "",
        filters.priceMax ?? "",
        filters.listingIntent ?? "",
        filters.propertyType ?? "",
        filters.condition ?? "",
      ].join("|"),
    [filters],
  );

  const listOpts = useMemo(
    () => ({
      categoryId,
      subcategoryId,
      sortMode,
      city: filters.city,
      region: filters.region,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      listingIntent: filters.listingIntent,
      propertyType: filters.propertyType,
      condition: filters.condition,
    }),
    [categoryId, subcategoryId, sortMode, filters],
  );

  const refetch = useCallback(async () => {
    if (!isBrowserOnline()) return;
    try {
      const [subs, list] = await Promise.all([
        listCatalogSubcategories(categoryId),
        listCatalogProducts(listOpts),
      ]);
      const subcats = subs.map((s) => ({ id: s.id, name: s.name }));
      setSubcategories(subcats);
      setProducts(list);
      if (!filterKey || filterKey === "||||||") {
        await setOfflineCategory({
          categoryId,
          subcategoryId,
          sortMode,
          products: list,
          subcategories: subcats,
          fetchedAt: Date.now(),
        });
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [categoryId, subcategoryId, sortMode, listOpts, filterKey]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const hasExtraFilters = Boolean(filterKey && filterKey !== "||||||");
      const cached = hasExtraFilters
        ? null
        : await getOfflineCategory(categoryId, subcategoryId, sortMode);
      if (cancelled) return;

      if (cached) {
        setProducts(cached.products);
        setSubcategories(cached.subcategories);
        setLoading(false);
      }

      if (!isBrowserOnline()) {
        if (!cached) setProducts(fallback);
        setLoading(false);
        return;
      }

      try {
        const [subs, list] = await Promise.all([
          listCatalogSubcategories(categoryId),
          listCatalogProducts(listOpts),
        ]);
        if (cancelled) return;
        const subcats = subs.map((s) => ({ id: s.id, name: s.name }));
        setSubcategories(subcats);
        setProducts(list);
        if (!hasExtraFilters) {
          await setOfflineCategory({
            categoryId,
            subcategoryId,
            sortMode,
            products: list,
            subcategories: subcats,
            fetchedAt: Date.now(),
          });
        }
      } catch {
        if (!cached) {
          setProducts(
            subcategoryId
              ? fallback.filter((p) => p.subcategoryId === subcategoryId)
              : fallback,
          );
          setSubcategories(DEMO_SUBCATEGORIES[categoryId] ?? []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [categoryId, subcategoryId, sortMode, filterKey, listOpts, fallback]);

  useEffect(() => {
    return onCatalogRefresh(() => {
      void refetch();
    });
  }, [refetch]);

  return { products, subcategories, loading: loading && products.length === 0 };
}
