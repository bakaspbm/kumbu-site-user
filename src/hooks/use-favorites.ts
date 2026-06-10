"use client";

import { useCallback, useEffect, useState } from "react";
import { toggleProductFavorite } from "@/lib/site-data";
import { useAuth } from "@/contexts/auth-context";

export const FAVORITES_LOGIN_ERROR = "favoritesLoginRequired";

export function useFavorites() {
  const { storeUser, isLoggedIn, refresh, applyStoreUser } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(storeUser?.favorites ?? []);
  }, [storeUser?.favorites]);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.includes(productId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      if (!isLoggedIn) throw new Error(FAVORITES_LOGIN_ERROR);

      const adding = !favoriteIds.includes(productId);
      const next = adding
        ? [...favoriteIds, productId]
        : favoriteIds.filter((id) => id !== productId);

      setFavoriteIds(next);
      try {
        await toggleProductFavorite(productId, adding);
        if (storeUser) {
          applyStoreUser({ ...storeUser, favorites: next });
        }
        void refresh();
      } catch (e) {
        setFavoriteIds(favoriteIds);
        throw e;
      }
    },
    [favoriteIds, isLoggedIn, refresh, storeUser, applyStoreUser],
  );

  return { favoriteIds, isFavorite, toggleFavorite };
}
