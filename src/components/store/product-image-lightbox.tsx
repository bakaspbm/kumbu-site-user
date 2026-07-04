"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { normalizeListingImageUrl } from "@/lib/store/product-images";
import { cn } from "@/lib/utils";

interface ProductImageLightboxProps {
  images: string[];
  initialIndex: number;
  title: string;
  open: boolean;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

export function ProductImageLightbox({
  images,
  initialIndex,
  title,
  open,
  onClose,
  onIndexChange,
}: ProductImageLightboxProps) {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const setIndexAndNotify = useCallback(
    (next: number) => {
      setZoom(1);
      setIndex(next);
      onIndexChange?.(next);
    },
    [onIndexChange],
  );

  const go = useCallback(
    (delta: number) => {
      setIndexAndNotify((index + delta + images.length) % images.length);
    },
    [images.length, index, setIndexAndNotify],
  );

  const src = normalizeListingImageUrl(images[index]) ?? images[index];
  const hasMany = images.length > 1;

  return (
    <ModalOverlay
      open={open}
      onClose={onClose}
      zIndexClass="z-[300]"
      overlayClassName="flex flex-col items-stretch justify-start bg-black/95 p-0"
      panelClassName={null}
      ariaLabel={t("photosTitle", { title })}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="truncate text-sm font-semibold text-white/90">
          {title}
          {hasMany && (
            <span className="ml-2 tabular-nums text-white/60">
              {index + 1} / {images.length}
            </span>
          )}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom((z) => (z >= 2 ? 1 : z + 0.5))}
            className="rounded-full p-2.5 text-white/90 transition hover:bg-white/10"
            aria-label={zoom >= 2 ? t("zoomOut") : t("zoomIn")}
          >
            {zoom >= 2 ? (
              <ZoomOut className="size-5" aria-hidden />
            ) : (
              <ZoomIn className="size-5" aria-hidden />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2.5 text-white/90 transition hover:bg-white/10"
            aria-label={tCommon("close")}
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-12">
        {hasMany && (
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-2 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/20 sm:left-4 sm:p-3"
            aria-label={t("prevPhoto")}
          >
            <ChevronLeft className="size-6 sm:size-7" aria-hidden />
          </button>
        )}

        <button
          type="button"
          className="flex max-h-full max-w-full cursor-zoom-in items-center justify-center overflow-auto focus:outline-none"
          onClick={() => setZoom((z) => (z >= 2 ? 1 : z + 0.5))}
          aria-label={t("toggleZoom")}
        >
          <div
            className={cn(
              "relative transition-transform duration-300 ease-out",
              zoom > 1 && "cursor-zoom-out",
            )}
            style={{ transform: `scale(${zoom})` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={t("photoAlt", { title, n: index + 1 })}
              className="max-h-[min(78dvh,900px)] max-w-[min(96vw,1200px)] rounded-lg object-contain shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </button>

        {hasMany && (
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-2 z-10 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/20 sm:right-4 sm:p-3"
            aria-label={t("nextPhoto")}
          >
            <ChevronRight className="size-6 sm:size-7" aria-hidden />
          </button>
        )}
      </div>

      {hasMany && (
        <div className="flex shrink-0 justify-center gap-2 overflow-x-auto px-4 pb-6 pt-1">
          {images.map((thumb, i) => (
            <button
              key={`${i}-${thumb}`}
              type="button"
              onClick={() => setIndexAndNotify(i)}
              className={cn(
                "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-16 sm:w-24",
                i === index
                  ? "border-white ring-2 ring-white/40"
                  : "border-white/20 opacity-70 hover:opacity-100",
              )}
              aria-label={t("viewPhotoN", { n: i + 1 })}
              aria-current={i === index}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={normalizeListingImageUrl(thumb) ?? thumb}
                alt=""
                className="size-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}
    </ModalOverlay>
  );
}
