"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ImagePlus, X } from "lucide-react";
import { MAX_LISTING_IMAGES } from "@/lib/store/product-images";
import { cn } from "@/lib/utils";

export type ListingImageItem = {
  id: string;
  file?: File;
  preview: string;
  url?: string;
};

interface ListingImagesUploadProps {
  items: ListingImageItem[];
  onChange: (items: ListingImageItem[]) => void;
}

function newId() {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const MAX_FILE_BYTES = 20 * 1024 * 1024;

export function ListingImagesUpload({
  items,
  onChange,
}: ListingImagesUploadProps) {
  const t = useTranslations("publish");
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = MAX_LISTING_IMAGES - items.length;

  function addFiles(files: FileList | null) {
    if (!files?.length || remaining <= 0) return;
    const next: ListingImageItem[] = [...items];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_LISTING_IMAGES) break;
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_FILE_BYTES) continue;
      next.push({
        id: newId(),
        file,
        preview: URL.createObjectURL(file),
      });
    }
    onChange(next);
  }

  function remove(id: string) {
    const item = items.find((i) => i.id === id);
    if (item?.preview.startsWith("blob:")) URL.revokeObjectURL(item.preview);
    onChange(items.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-kumbu-foreground">{t("listingPhotosTitle")}</p>
        <span className="text-[11px] font-medium text-kumbu-muted">
          {items.length}/{MAX_LISTING_IMAGES}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="relative aspect-square overflow-hidden rounded-xl border border-kumbu-border bg-kumbu-surface-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.preview}
              alt=""
              className="size-full object-cover"
            />
            {index === 0 && (
              <span className="absolute left-1 top-1 rounded-md bg-kumbu-primary px-1.5 py-0.5 text-[9px] font-bold text-white">
                {t("coverBadge")}
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-lg bg-black/55 text-white hover:bg-black/70"
              aria-label={t("removePhotoAria")}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-kumbu-border",
              "bg-kumbu-surface text-kumbu-muted transition-colors hover:border-kumbu-primary/30 hover:bg-kumbu-primary-soft/40 hover:text-kumbu-primary",
            )}
          >
            <ImagePlus className="size-6" strokeWidth={1.75} />
            <span className="text-[10px] font-semibold">{t("addPhotoBtn")}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-kumbu-border bg-kumbu-surface text-[13px] font-semibold text-kumbu-foreground hover:bg-kumbu-secondary"
        >
          <ImagePlus className="size-4 text-kumbu-primary" />
          {t("choosePhotosBtn", { remaining })}
        </button>
      )}

      {items.length === 0 && (
        <p className="rounded-xl bg-kumbu-primary-soft/60 px-3 py-2 text-xs text-kumbu-muted">
          {t("photoTip")}
        </p>
      )}
    </div>
  );
}
