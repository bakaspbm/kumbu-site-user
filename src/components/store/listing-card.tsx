"use client";

import Link from "next/link";
import { ImageIcon, MapPin } from "lucide-react";
import { ListingImage } from "@/components/ui/listing-image";
import { FavoriteButton } from "@/components/store/favorite-button";
import { productCoverUrl } from "@/lib/store/product-images";
import { cn, productPlaceholderStyle } from "@/lib/utils";
import type { CatalogProduct } from "@/types/store";

function locationLabel(product: CatalogProduct) {
  const t = product.deliveryText?.trim();
  if (t) return t.length > 48 ? `${t.slice(0, 48)}…` : t;
  return product.seller?.displayName ?? "Angola";
}

interface ListingCardProps {
  product: CatalogProduct;
  variant?: "list" | "grid";
  className?: string;
}

export function ListingCard({ product, variant = "grid", className }: ListingCardProps) {
  const cover = productCoverUrl(product);

  if (variant === "grid") {
    return (
      <article className={cn("kumbu-card-interactive group overflow-hidden", className)}>
        <Link href={`/produto/${product.id}`} prefetch className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-kumbu-surface-muted">
            {cover ? (
              <ListingImage
                src={cover}
                alt=""
                fill
                className="transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                className="flex h-full items-center justify-center"
                style={productPlaceholderStyle(product.imageColor)}
              >
                <ImageIcon className="size-8 text-white/50" />
              </div>
            )}
            <FavoriteButton
              productId={product.id}
              size="sm"
              className="absolute right-2.5 top-2.5 border-0 bg-white/95 shadow-md backdrop-blur-sm"
            />
          </div>
          <div className="p-4">
            <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-kumbu-foreground group-hover:text-kumbu-primary">
              {product.title}
            </h3>
            <p className="mt-2 text-base font-extrabold tracking-tight text-kumbu-primary">
              {product.priceLabel}
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-kumbu-muted">
              <MapPin className="size-3 shrink-0 opacity-60" />
              {locationLabel(product)}
            </p>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className={cn("kumbu-card-interactive group overflow-hidden", className)}>
      <Link
        href={`/produto/${product.id}`}
        prefetch
        className="flex gap-4 p-4 transition-colors"
      >
        <div className="relative size-[5.5rem] shrink-0 overflow-hidden rounded-2xl bg-kumbu-surface-muted shadow-inner md:size-28">
          {cover ? (
            <ListingImage
              src={cover}
              alt=""
              fill
              className="transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="flex h-full items-center justify-center"
              style={productPlaceholderStyle(product.imageColor)}
            >
              <ImageIcon className="size-7 text-white/50" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-kumbu-foreground transition-colors group-hover:text-kumbu-primary md:text-base">
            {product.title}
          </h3>
          <p className="mt-2 text-lg font-extrabold tracking-tight text-kumbu-primary">
            {product.priceLabel}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-kumbu-muted">
            <MapPin className="size-3 shrink-0 opacity-60" />
            {locationLabel(product)}
          </p>
        </div>
        <div className="flex shrink-0 items-start pt-1" onClick={(e) => e.preventDefault()}>
          <FavoriteButton productId={product.id} size="sm" className="border-0 bg-transparent" />
        </div>
      </Link>
    </article>
  );
}
