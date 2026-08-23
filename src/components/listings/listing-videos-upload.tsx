"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Film, X } from "lucide-react";
import {
  LISTING_VIDEO_ACCEPT,
  MAX_LISTING_VIDEO_BYTES,
  MAX_LISTING_VIDEO_SECONDS,
  MAX_LISTING_VIDEOS,
  isAllowedListingVideo,
  readVideoDurationSeconds,
} from "@/lib/listings/media-accept";
import { cn } from "@/lib/utils";

export type ListingVideoItem = {
  id: string;
  file?: File;
  preview: string;
  url?: string;
};

interface ListingVideosUploadProps {
  items: ListingVideoItem[];
  onChange: (items: ListingVideoItem[]) => void;
}

function newId() {
  return `vid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function ListingVideosUpload({ items, onChange }: ListingVideosUploadProps) {
  const t = useTranslations("publish");
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const remaining = MAX_LISTING_VIDEOS - items.length;

  async function addFiles(files: FileList | null) {
    if (!files?.length || remaining <= 0) return;
    setLocalError(null);
    const next = [...items];

    for (const file of Array.from(files)) {
      if (next.length >= MAX_LISTING_VIDEOS) break;
      if (!isAllowedListingVideo(file)) {
        setLocalError(t("listingVideoInvalidType"));
        continue;
      }
      if (file.size > MAX_LISTING_VIDEO_BYTES) {
        setLocalError(t("listingVideoTooLarge"));
        continue;
      }
      // Duração: se o browser não conseguir ler metadados (ex. HEVC no telemóvel),
      // não tratar como «formato inválido» — a API valida se é vídeo de verdade.
      try {
        const seconds = await readVideoDurationSeconds(file);
        if (seconds > MAX_LISTING_VIDEO_SECONDS + 0.5) {
          setLocalError(t("listingVideoTooLong"));
          continue;
        }
      } catch {
        /* metadados indisponíveis — aceitar e deixar o servidor validar */
      }
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
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-kumbu-foreground">
            {t("listingVideoTitle")}{" "}
            <span className="font-normal text-kumbu-muted">({t("optionalLabel")})</span>
          </p>
          <p className="text-[11px] text-kumbu-muted">{t("listingVideoHint")}</p>
        </div>
        <span className="text-[11px] font-medium text-kumbu-muted">
          {items.length}/{MAX_LISTING_VIDEOS}
        </span>
      </div>

      {localError ? <p className="text-xs text-red-700">{localError}</p> : null}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative overflow-hidden rounded-xl border border-kumbu-border bg-black"
          >
            <video
              src={item.preview}
              className="aspect-video w-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-lg bg-black/55 text-white hover:bg-black/70"
              aria-label={t("listingVideoRemove")}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {remaining > 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex aspect-video flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-kumbu-border",
              "bg-kumbu-surface text-kumbu-muted transition-colors hover:border-kumbu-primary/30 hover:bg-kumbu-primary-soft/40 hover:text-kumbu-primary",
            )}
          >
            <Film className="size-6" strokeWidth={1.75} />
            <span className="text-[10px] font-semibold">{t("listingVideoAdd")}</span>
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={LISTING_VIDEO_ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          void addFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
