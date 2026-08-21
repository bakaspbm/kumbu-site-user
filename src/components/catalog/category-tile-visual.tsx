"use client";

import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import { getCategoryThumbSrc } from "@/lib/catalog/category-thumbs";
import { cn } from "@/lib/utils";

type Props = {
  categoryId: string;
  categoryName: string;
  className?: string;
  /** Larger tile on /categorias list rows */
  size?: "sm" | "md";
};

export function CategoryTileVisual({
  categoryId,
  categoryName,
  className,
  size = "sm",
}: Props) {
  const src = getCategoryThumbSrc(categoryId, categoryName);
  const dim = size === "md" ? 56 : 48;

  if (!src) {
    return (
      <span
        className={cn(
          "kumbu-category-tile-icon kumbu-category-tile-icon--fallback",
          size === "md" && "size-14",
          className,
        )}
      >
        <LayoutGrid className="size-5" strokeWidth={1.75} aria-hidden />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "kumbu-category-tile-icon kumbu-category-tile-icon--photo",
        size === "md" && "size-14",
        className,
      )}
    >
      <Image
        src={src}
        alt=""
        width={dim}
        height={dim}
        className="size-full object-cover"
        sizes={`${dim}px`}
      />
    </span>
  );
}
