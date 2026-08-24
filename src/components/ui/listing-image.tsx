"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { resolveListingImageForOptimizer } from "@/lib/store/product-images";

export const LISTING_IMAGE_SIZES = {
  gridCard: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px",
  listThumb: "(max-width: 768px) 88px, 112px",
  rowCard: "72px",
  productMain: "(max-width: 1024px) 100vw, 480px",
  productThumb: "132px",
  avatar: "80px",
  chatThumb: "64px",
  smallAvatar: "48px",
} as const;

interface ListingImageProps {
  src: string;
  alt?: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

export function ListingImage({
  src,
  alt = "",
  className,
  fill,
  priority,
  sizes = LISTING_IMAGE_SIZES.gridCard,
  quality = 75,
}: ListingImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveListingImageForOptimizer(src);

  if (failed || !resolved) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-kumbu-surface-muted text-center text-[11px] font-medium text-kumbu-muted",
          fill ? "absolute inset-0 size-full" : "min-h-24 w-full rounded-xl p-3",
          className,
        )}
        role="img"
        aria-label={alt || "Imagem indisponível"}
      >
        Imagem indisponível
      </div>
    );
  }

  if (!fill) {
    return (
      <Image
        src={resolved}
        alt={alt}
        width={280}
        height={280}
        sizes={sizes}
        priority={priority}
        quality={quality}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
