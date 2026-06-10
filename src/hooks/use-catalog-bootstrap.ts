"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { onCatalogRefresh } from "@/lib/catalog-refresh";
import { getFeaturedProductsBackend } from "@/lib/kumbu-api/store";
import { getHomeRecommendationsBackend } from "@/lib/kumbu-api/recommendations";
import { demoCategories, demoProducts } from "@/lib/store/demo-data";
import {
  listCatalogCategories,
  listFeedProducts,
} from "@/lib/site-data";
import type { CatalogBootstrap } from "@/lib/store/catalog-cache";
import {
  getOfflineBootstrap,
  isBrowserOnline,
  setOfflineBootstrap,
  shouldRevalidate,
} from "@/lib/offline/store";
import type { CatalogCategory, CatalogProduct } from "@/types/store";

const SESSION_KEY = "kumbu_catalog_bootstrap_v2";

function readSessionCache(): CatalogBootstrap | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as CatalogBootstrap;
    if (!isBrowserOnline()) return data;
    if (shouldRevalidate(data.fetchedAt)) return null;
    return data;
  } catch {
    return null;
  }
}

function writeSessionCache(data: CatalogBootstrap) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
  }
}

async function fetchBootstrap(): Promise<CatalogBootstrap> {
  const [categories, feed, featured] = await Promise.all([
    listCatalogCategories(),
    listFeedProducts(28),
    getHomeRecommendationsBackend(12).then((rec) => {
      const merged = [...rec.forYou, ...rec.trending, ...rec.newNearby];
      const seen = new Set<string>();
      const unique = merged.filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
      return unique.length > 0 ? unique.slice(0, 8) : getFeaturedProductsBackend(5);
    }),
  ]);
  return {
    categories,
    featured,
    feed,
    isDemo: false,
    fetchedAt: Date.now(),
  };
}

async function loadInitial(): Promise<CatalogBootstrap | null> {
  const session = readSessionCache();
  if (session) return session;
  const idb = await getOfflineBootstrap();
  if (idb) return idb;
  return null;
}

export function useCatalogBootstrap() {
  const [data, setData] = useState<CatalogBootstrap | null>(null);
  const [loading, setLoading] = useState(true);
  const dataRef = useRef<CatalogBootstrap | null>(null);
  dataRef.current = data;

  const refresh = useCallback(async (force = false) => {
    if (!isBrowserOnline()) return;

    const cached = dataRef.current;
    if (!force && cached && !shouldRevalidate(cached.fetchedAt)) return;

    try {
      const fresh = await fetchBootstrap();
      setData(fresh);
      writeSessionCache(fresh);
      await setOfflineBootstrap(fresh);
    } catch {
      if (!dataRef.current) {
        setData({
          categories: demoCategories,
          featured: demoProducts.slice(0, 5),
          feed: demoProducts,
          isDemo: true,
          fetchedAt: Date.now(),
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const initial = await loadInitial();
      if (cancelled) return;
      if (initial) {
        setData(initial);
        setLoading(false);
      }

      if (!isBrowserOnline()) {
        if (!initial) {
          setData({
            categories: demoCategories,
            featured: demoProducts.slice(0, 5),
            feed: demoProducts,
            isDemo: true,
            fetchedAt: Date.now(),
          });
        }
        setLoading(false);
        return;
      }

      if (initial && !shouldRevalidate(initial.fetchedAt)) {
        return;
      }

      await refresh(true);
    })();

    return () => {
      cancelled = true;
    };
    
  }, []);

  useEffect(() => {
    return onCatalogRefresh(() => {
      void refresh(true);
    });
  }, [refresh]);

  return {
    categories: data?.categories ?? [],
    featured: data?.featured ?? [],
    feed: data?.feed ?? [],
    isDemo: data?.isDemo ?? false,
    loading: loading && !data,
    refresh: () => refresh(true),
  };
}

export type { CatalogCategory, CatalogProduct };
