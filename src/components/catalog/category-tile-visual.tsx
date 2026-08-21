"use client";

import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import { getCategoryThumbSrc } from "@/lib/catalog/category-thumbs";
import { cn } from "@/lib/utils";

type Props = {
  categoryId: string;
  categoryName: string;
  className?: string;
  /** Compact square for /categorias list rows */
  size?: "sm" | "md";
};

export function CategoryTileVisual({
  categoryId,
  categoryName,
  className,
  size = "sm",
}: Props) {
  const src = getCategoryThumbSrc(categoryId, categoryName);
  const isList = size === "md";
  const dim = isList ? 72 : 160;

  if (!src) {
    return (
      <span
        className={cn(
          isList
            ? "flex size-[4.5rem] shrink-0 items-center justify-center rounded-2xl bg-kumbu-primary-soft text-kumbu-primary"
            : "kumbu-category-tile-icon kumbu-category-tile-icon--fallback",
          className,
        )}
      >
        <LayoutGrid className="size-6" strokeWidth={1.75} aria-hidden />
      </span>
    );
  }

  if (isList) {
    return (
      <span
        className={cn(
          "relative block size-[4.5rem] shrink-0 overflow-hidden rounded-2xl",
          className,
        )}
      >
        <Image
          src={src}
          alt=""
          width={dim}
          height={dim}
          className="size-full object-cover"
          sizes="72px"
        />
      </span>
    );
  }

  return (
    <span className={cn("kumbu-category-tile-icon kumbu-category-tile-icon--photo", className)}>
      <Image
        src={src}
        alt=""
        width={dim}
        height={dim}
        className="size-full object-cover"
        sizes="(max-width: 768px) 116px, 160px"
      />
    </span>
  );
}
