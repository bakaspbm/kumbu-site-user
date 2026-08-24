"use client";

import { useState } from "react";
import type { CatalogProduct } from "@/types/store";

function VideoItem({ videoUrl }: { videoUrl: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="overflow-hidden rounded-[var(--radius-kumbu-xl)] border border-kumbu-border bg-black shadow-[var(--shadow-kumbu-sm)]">
      {failed ? (
        <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-kumbu-surface-muted px-4 text-center">
          <p className="text-sm font-medium text-kumbu-foreground">
            Não foi possível reproduzir este vídeo neste browser.
          </p>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-kumbu-primary underline"
          >
            Abrir / descarregar vídeo
          </a>
        </div>
      ) : (
        <video
          src={videoUrl}
          controls
          playsInline
          preload="metadata"
          className="max-h-[min(70vh,520px)] w-full"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export function ListingVideoPlayer({ product }: { product: CatalogProduct }) {
  const urls = (
    product.videoUrls?.length
      ? product.videoUrls
      : product.videoUrl
        ? [product.videoUrl]
        : []
  )
    .map((u) => u?.trim())
    .filter((u): u is string => Boolean(u))
    .slice(0, 3);

  if (urls.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      {urls.map((videoUrl) => (
        <VideoItem key={videoUrl} videoUrl={videoUrl} />
      ))}
    </div>
  );
}
