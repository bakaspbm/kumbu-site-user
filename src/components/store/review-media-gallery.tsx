"use client";

import type { ProductReviewMedia } from "@/types/review";

export function ReviewMediaGallery({ media }: { media: ProductReviewMedia[] }) {
  if (media.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {media.map((item, i) =>
        item.type === "video" ? (
          <video
            key={`${item.url}-${i}`}
            src={item.url}
            controls
            playsInline
            className="max-h-48 max-w-full rounded-xl border border-kumbu-border bg-black"
            preload="metadata"
          />
        ) : (
          <a
            key={`${item.url}-${i}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-xl border border-kumbu-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt=""
              className="h-28 w-28 object-cover sm:h-32 sm:w-32"
            />
          </a>
        ),
      )}
    </div>
  );
}
