"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CategoryTileVisual } from "@/components/catalog/category-tile-visual";
import { getCategoryExploreHref } from "@/lib/catalog/category-links";
import { localizeCategoryName } from "@/lib/catalog/localize-catalog";
import type { CatalogCategory } from "@/types/store";

export function CategoryChips({ categories }: { categories: CatalogCategory[] }) {
  const tCatalog = useTranslations("catalog");

  if (categories.length === 0) return null;

  return (
    <div className="kumbu-container pb-2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((c) => {
          const href = getCategoryExploreHref(c);
          return (
            <Link
              key={c.id}
              href={href}
              className="kumbu-category-tile min-w-0 md:aspect-auto"
            >
              <CategoryTileVisual categoryId={c.id} categoryName={c.name} />
              <span className="kumbu-category-tile-label max-w-none">
                {localizeCategoryName(c, tCatalog)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
