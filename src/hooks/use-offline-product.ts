"use client";

import { useCallback, useEffect, useState } from "react";
import { onCatalogRefresh } from "@/lib/catalog-refresh";
import { demoProducts } from "@/lib/store/demo-data";
import { getCatalogProduct } from "@/lib/site-data";
import {
  getOfflineProduct,
  isBrowserOnline,
  setOfflineProduct,
} from "@/lib/offline/store";
import type { CatalogProduct } from "@/types/store";

export function useOfflineProduct(productId: string) {
  const demo = demoProducts.find((p) => p.id === productId) ?? null;
  const [product, setProduct] = useState<CatalogProduct | null>(demo);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);

  const refetch = useCallback(async () => {
    if (!isBrowserOnline()) return;
    try {
      const fresh = await getCatalogProduct(productId);
      if (fresh) {
        setProduct(fresh);
        setFromCache(false);
        await setOfflineProduct(fresh);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const cached = await getOfflineProduct(productId);
      if (cancelled) return;

      if (cached) {
        setProduct(cached);
        setFromCache(true);
        setLoading(false);
      }

      if (!isBrowserOnline()) {
        if (!cached && demo) setProduct(demo);
        setLoading(false);
        return;
      }

      try {
        const fresh = await getCatalogProduct(productId);
        if (cancelled) return;
        if (fresh) {
          setProduct(fresh);
          setFromCache(false);
          await setOfflineProduct(fresh);
        } else if (!cached) {
          setProduct(demo);
        }
      } catch {
        if (!cached && demo) setProduct(demo);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [productId, demo]);

  useEffect(() => {
    return onCatalogRefresh(() => {
      void refetch();
    });
  }, [refetch]);

  return {
    product,
    loading: loading && !product,
    fromCache,
    isOffline: !isBrowserOnline(),
  };
}
