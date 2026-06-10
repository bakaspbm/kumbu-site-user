"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Expand, ShoppingBag } from "lucide-react";
import { ListingImage } from "@/components/ui/listing-image";
import { ProductImageLightbox } from "@/components/store/product-image-lightbox";
import { productImageUrls } from "@/lib/store/product-images";
import { cn, productPlaceholderStyle } from "@/lib/utils";
import type { CatalogProduct } from "@/types/store";

interface ProductImageGalleryProps {
  product: CatalogProduct;
}

const MAIN_FRAME = "aspect-[3/4] w-full max-w-md mx-auto lg:max-w-none lg:mx-0";
const THUMB_FRAME = "relative aspect-[3/4] w-[5.75rem] shrink-0 sm:w-[7rem] md:w-[8.25rem]";

export function ProductImageGallery({ product }: ProductImageGalleryProps) {
  const t = useTranslations("product");
  const images = productImageUrls(product);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const current = images[active];

  const openLightbox = (index: number) => {
    setActive(index);
    setLightboxOpen(true);
  };

  if (images.length === 0) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-[var(--radius-kumbu-xl)] border border-kumbu-border bg-kumbu-surface shadow-[var(--shadow-kumbu-md)]",
          MAIN_FRAME,
        )}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={productPlaceholderStyle(product.imageColor)}
        >
          <ShoppingBag className="size-20 text-white/70 md:size-28" aria-hidden />
        </div>
      </div>
    );
  }

  const hasMany = images.length > 1;

  return (
    <>
      <div
        className={cn(
          "w-full gap-3",
          hasMany
            ? "grid grid-cols-1 lg:grid-cols-[8.25rem_minmax(0,1fr)] lg:items-start"
            : "block",
        )}
      >
        {hasMany && (
          <div
            className="order-2 flex gap-2.5 overflow-x-auto pb-1 lg:order-1 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:max-h-[min(80vh,760px)] lg:pr-0.5"
            role="tablist"
            aria-label={t("thumbnailsAria")}
          >
            {images.map((src, i) => (
              <button
                key={`${i}-${src}`}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={t("photoN", { n: i + 1 })}
                onClick={() => setActive(i)}
                className={cn(
                  THUMB_FRAME,
                  "lg:w-full",
                  "overflow-hidden rounded-xl border-2 transition-all",
                  i === active
                    ? "border-kumbu-primary ring-2 ring-kumbu-primary/25 shadow-[var(--shadow-kumbu-sm)]"
                    : "border-kumbu-border opacity-80 hover:border-kumbu-primary/35 hover:opacity-100",
                )}
              >
                <ListingImage src={src} alt="" fill />
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => openLightbox(active)}
          className={cn(
            "group relative order-1 block overflow-hidden rounded-[var(--radius-kumbu-xl)] border border-kumbu-border bg-kumbu-surface-muted shadow-[var(--shadow-kumbu-md)] lg:order-2",
            MAIN_FRAME,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kumbu-primary focus-visible:ring-offset-2",
          )}
          aria-label={t("expandPhoto")}
        >
          <ListingImage
            src={current}
            alt={product.title}
            fill
            priority
            className="object-contain"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {hasMany && (
            <span className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white tabular-nums backdrop-blur-sm">
              {active + 1} / {images.length}
            </span>
          )}
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-kumbu-foreground shadow-sm">
            <Expand className="size-3.5 text-kumbu-primary" aria-hidden />
            {t("tapToExpand")}
          </span>
        </button>
      </div>

      {lightboxOpen && (
        <ProductImageLightbox
          images={images}
          initialIndex={active}
          title={product.title}
          onIndexChange={setActive}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
