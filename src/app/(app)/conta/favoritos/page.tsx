"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { ContaPageHeader } from "@/components/account/conta-page-header";
import { ContaPanel } from "@/components/account/conta-section";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { ListingCard } from "@/components/store/listing-card";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmptyState } from "@/components/ui/empty-state";
import { useFavorites } from "@/hooks/use-favorites";
import { useAuth } from "@/contexts/auth-context";
import { getCatalogProductsByIds } from "@/lib/site-data";
import { demoProducts } from "@/lib/store/demo-data";
import {
  getOfflineProductsByIds,
  isBrowserOnline,
  setOfflineProduct,
} from "@/lib/offline/store";
import { useEffect, useState } from "react";
import type { CatalogProduct } from "@/types/store";

export default function FavoritosPage() {
  const t = useTranslations("accountPages.favorites");
  const { favoriteIds } = useFavorites();
  const { isLoggedIn } = useAuth();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || favoriteIds.length === 0) {
      setProducts([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      const cached = await getOfflineProductsByIds(favoriteIds);
      if (!cancelled && cached.length > 0) {
        setProducts(cached);
        setLoading(false);
      }

      if (!isBrowserOnline()) {
        if (!cancelled && cached.length === 0) {
          setProducts(demoProducts.filter((p) => favoriteIds.includes(p.id)));
        }
        setLoading(false);
        return;
      }

      try {
        const fresh = await getCatalogProductsByIds(favoriteIds);
        if (!cancelled) {
          setProducts(fresh);
          await Promise.all(fresh.map((p) => setOfflineProduct(p)));
        }
      } catch {
        if (!cancelled && cached.length === 0) {
          setProducts(demoProducts.filter((p) => favoriteIds.includes(p.id)));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [favoriteIds, isLoggedIn]);

  return (
    <RequireAuth>
      <OfflineBanner />
      <ContaPanel>
        <ContaPageHeader
          icon={Heart}
          title={t("title")}
          description={t("description")}
        />
        {loading && products.length === 0 ? (
          <p className="py-12 text-center text-sm text-kumbu-muted">{t("loading")}</p>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Heart}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
            actionLabel={t("emptyAction")}
            actionHref="/procurar"
          />
        ) : (
          <ul className="kumbu-listing-grid">
            {products.map((p) => (
              <li key={p.id}>
                <ListingCard product={p} variant="grid" />
              </li>
            ))}
          </ul>
        )}
      </ContaPanel>
    </RequireAuth>
  );
}
