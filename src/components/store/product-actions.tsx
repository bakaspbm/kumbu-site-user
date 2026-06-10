"use client";

import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { FavoriteButton } from "@/components/store/favorite-button";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import type { CatalogProduct } from "@/types/store";

export function ProductActions({ product }: { product: CatalogProduct }) {
  const { user, isLoggedIn } = useAuth();
  const isOwnListing = isLoggedIn && user?.id === product.sellerId;

  if (isOwnListing) {
    return (
      <div className="space-y-3">
        <p className="rounded-xl bg-kumbu-secondary px-4 py-3 text-sm text-kumbu-muted">
          Este é o seu anúncio. Gerir em Os meus anúncios.
        </p>
        <Button href="/conta/anuncios" fullWidth variant="secondary" className="h-12">
          Os meus anúncios
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex-1">
        <AddToCartButton product={product} />
      </div>
      <FavoriteButton productId={product.id} className="shrink-0 self-center sm:self-auto" />
    </div>
  );
}
