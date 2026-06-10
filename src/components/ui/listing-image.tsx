"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { normalizeListingImageUrl } from "@/lib/store/product-images";

interface ListingImageProps {
  src: string;
  alt?: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
}

export function ListingImage({
  src,
  alt = "",
  className,
  fill,
  priority,
}: ListingImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = normalizeListingImageUrl(src) ?? src;

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

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn(
        fill ? "absolute inset-0 h-full w-full object-cover" : "h-full w-full object-cover",
        className,
      )}
    />
  );

  if (fill) return img;
  return img;
}
