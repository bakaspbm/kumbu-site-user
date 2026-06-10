"use client";

import { useEffect } from "react";
import type { CatalogBootstrap } from "@/lib/store/catalog-cache";
import {
  getOfflineBootstrap,
  setOfflineBootstrap,
  shouldRevalidate,
} from "@/lib/offline/store";

export function OfflineBootstrapSync() {
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const existing = await getOfflineBootstrap();
      if (existing && !shouldRevalidate(existing.fetchedAt)) return;

      try {
        const res = await fetch("/api/offline/bootstrap");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as CatalogBootstrap;
        if (!cancelled) await setOfflineBootstrap(data);
      } catch {
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
