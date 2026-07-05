"use client";

import Link from "next/link";
import { MapPin, ShoppingBag } from "lucide-react";
import { ListingImage } from "@/components/ui/listing-image";
import { FavoriteButton } from "@/components/store/favorite-button";
import { ListingRatingBadge } from "@/components/store/listing-rating-badge";
import { productCoverUrl } from "@/lib/store/product-images";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { isJobListing } from "@/lib/jobs/category";
import { isPropertyListing } from "@/lib/property/category";
import { cn, productPlaceholderStyle } from "@/lib/utils";
import type { CatalogProduct } from "@/types/store";

interface ProductCardProps {
  product: CatalogProduct;
  variant?: "row" | "grid";
}

export function ProductCard({ product, variant = "grid" }: ProductCardProps) {
  const { addProduct } = useCart();
  const { user } = useAuth();
  const isOwn = user?.id === product.sellerId;
  const isGrid = variant === "grid";
  const cover = productCoverUrl(product);
  const canAddToCart =
    !isPropertyListing(product) &&
    !isJobListing(product) &&
    product.listingKind !== "property" &&
    product.listingKind !== "job";

  return (
    <article
      className={cn(
        "kumbu-card-interactive group overflow-hidden",
        isGrid ? "flex flex-col" : "flex gap-3 p-3",
      )}
    >
      <Link
        href={`/produto/${product.id}`}
        prefetch
        className={cn(
          "relative block shrink-0 overflow-hidden bg-kumbu-secondary",
          isGrid ? "aspect-[5/4] w-full" : "size-[4.5rem] rounded-2xl",
        )}
      >
        {cover ? (
          <ListingImage
            src={cover}
            alt={product.title}
            fill
            className="transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={productPlaceholderStyle(product.imageColor)}
          >
            <ShoppingBag
              className={cn("text-white/60", isGrid ? "size-9" : "size-5")}
              aria-hidden
            />
          </div>
        )}
        {product.isFeatured && isGrid && (
          <span className="absolute left-2 top-2 kumbu-pill bg-kumbu-primary text-white shadow-sm">
            Destaque
          </span>
        )}
        <FavoriteButton
          productId={product.id}
          size="sm"
          className="absolute right-2 top-2 border-0 bg-white/95 shadow-sm backdrop-blur-sm"
        />
      </Link>

      <div className={cn("flex min-w-0 flex-1 flex-col", isGrid && "p-3.5 pt-3")}>
        <Link href={`/produto/${product.id}`} className="block flex-1">
          <h3
            className={cn(
              "font-semibold leading-snug text-kumbu-foreground transition-colors group-hover:text-kumbu-primary",
              isGrid ? "line-clamp-2 text-[13px]" : "line-clamp-2 text-sm",
            )}
          >
            {product.title}
          </h3>

          {product.seller?.displayName && isGrid && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-kumbu-muted">
              <MapPin className="size-3 shrink-0 opacity-70" aria-hidden />
              <span className="truncate">{product.seller.displayName}</span>
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-[15px] font-bold tracking-tight text-kumbu-foreground">
              {product.priceLabel}
            </p>
            <ListingRatingBadge product={product} />
          </div>

          {product.isOutOfStock && (
            <p className="mt-1.5 text-[11px] font-semibold text-red-600">Indisponível</p>
          )}
        </Link>

        {!product.isOutOfStock && isOwn && (
          <p className="mt-2.5 text-center text-[11px] font-semibold text-kumbu-muted">
            O seu anúncio
          </p>
        )}

        {!product.isOutOfStock && !isOwn && canAddToCart && (
          <button
            type="button"
            onClick={() => {
              addProduct(product);
            }}
            className={cn(
              "mt-2.5 w-full rounded-lg border border-kumbu-border bg-kumbu-surface py-2 text-xs font-semibold text-kumbu-foreground",
              "transition-colors hover:border-kumbu-primary/30 hover:bg-kumbu-primary-soft hover:text-kumbu-primary",
              !isGrid && "mt-2 w-auto px-3",
            )}
          >
            Adicionar
          </button>
        )}
      </div>
    </article>
  );
}
