"use client";

import { useCallback, useEffect, useState } from "react";
import { onCatalogRefresh } from "@/lib/catalog-refresh";
import { getPublicSeller, listSellerProducts } from "@/lib/site-data";
import {
  getOfflineSeller,
  isBrowserOnline,
  setOfflineSeller,
} from "@/lib/offline/store";
import type { CatalogProduct, SellerSummary } from "@/types/store";

export function useOfflineSeller(sellerId: string) {
  const [seller, setSeller] = useState<SellerSummary | null>(null);
  const [listings, setListings] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!isBrowserOnline()) return;
    try {
      const [s, list] = await Promise.all([
        getPublicSeller(sellerId),
        listSellerProducts(sellerId, 48),
      ]);
      const resolvedSeller =
        s ??
        list.find((p) => p.seller?.id === sellerId)?.seller ??
        (list.length > 0
          ? {
              id: sellerId,
              displayName: list[0].seller?.displayName ?? "Vendedor",
              photoUrl: list[0].seller?.photoUrl ?? null,
              phone: null,
              city: list[0].seller?.city ?? list[0].deliveryText ?? null,
            }
          : null);

      if (resolvedSeller) {
        setSeller(resolvedSeller);
        setListings(list);
        await setOfflineSeller({
          seller: resolvedSeller,
          listings: list,
          fetchedAt: Date.now(),
        });
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const cached = await getOfflineSeller(sellerId);
      if (cancelled) return;

      if (cached) {
        setSeller(cached.seller);
        setListings(cached.listings);
        setLoading(false);
      }

      if (!isBrowserOnline()) {
        setLoading(false);
        return;
      }

      try {
        const [s, list] = await Promise.all([
          getPublicSeller(sellerId),
          listSellerProducts(sellerId, 48),
        ]);
        if (cancelled) return;

        const resolvedSeller =
          s ??
          list.find((p) => p.seller?.id === sellerId)?.seller ??
          (list.length > 0
            ? {
                id: sellerId,
                displayName: list[0].seller?.displayName ?? "Vendedor",
                photoUrl: list[0].seller?.photoUrl ?? null,
                phone: null,
                city: list[0].seller?.city ?? list[0].deliveryText ?? null,
              }
            : null);

        if (resolvedSeller) {
          setSeller(resolvedSeller);
          setListings(list);
          await setOfflineSeller({
            seller: resolvedSeller,
            listings: list,
            fetchedAt: Date.now(),
          });
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  useEffect(() => {
    return onCatalogRefresh(() => {
      void refetch();
    });
  }, [refetch]);

  return { seller, listings, loading: loading && !seller };
}
