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

interface UseOfflineCategoryOpts {
  categoryId: string;
  subcategoryId?: string;
  sortMode?: SortMode;
}

export function useOfflineCategory({
  categoryId,
  subcategoryId,
  sortMode = "default",
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

  const refetch = useCallback(async () => {
    if (!isBrowserOnline()) return;
    try {
      const [subs, list] = await Promise.all([
        listCatalogSubcategories(categoryId),
        listCatalogProducts({
          categoryId,
          subcategoryId,
          sortMode,
        }),
      ]);
      const subcats = subs.map((s) => ({ id: s.id, name: s.name }));
      setSubcategories(subcats);
      setProducts(list);
      await setOfflineCategory({
        categoryId,
        subcategoryId,
        sortMode,
        products: list,
        subcategories: subcats,
        fetchedAt: Date.now(),
      });
    } catch {
    } finally {
      setLoading(false);
    }
  }, [categoryId, subcategoryId, sortMode]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const cached = await getOfflineCategory(
        categoryId,
        subcategoryId,
        sortMode,
      );
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
          listCatalogProducts({
            categoryId,
            subcategoryId,
            sortMode,
          }),
        ]);
        if (cancelled) return;
        const subcats = subs.map((s) => ({ id: s.id, name: s.name }));
        setSubcategories(subcats);
        setProducts(list);
        await setOfflineCategory({
          categoryId,
          subcategoryId,
          sortMode,
          products: list,
          subcategories: subcats,
          fetchedAt: Date.now(),
        });
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
  }, [categoryId, subcategoryId, sortMode, fallback]);

  useEffect(() => {
    return onCatalogRefresh(() => {
      void refetch();
    });
  }, [refetch]);

  return { products, subcategories, loading: loading && products.length === 0 };
}
