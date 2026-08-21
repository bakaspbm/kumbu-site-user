"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { CategoryTileVisual } from "@/components/catalog/category-tile-visual";
import { getCategoryExploreHref } from "@/lib/catalog/category-links";
import { localizeCategoryName } from "@/lib/catalog/localize-catalog";
import type { CatalogCategory } from "@/types/store";

export function HomeCategoryRow({ categories }: { categories: CatalogCategory[] }) {
  const t = useTranslations("home");
  const tCatalog = useTranslations("catalog");

  if (categories.length === 0) return null;

  return (
    <section className="kumbu-container py-2 md:py-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="kumbu-section-title">{t("categories")}</h2>
        <Link href="/categorias" className="kumbu-link-pill">
          {t("seeAllCategories")}
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
      <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1 scrollbar-none md:grid md:grid-cols-5 md:gap-2.5 md:overflow-visible lg:grid-cols-6">
        {categories.map((c) => {
          const href = getCategoryExploreHref(c);
          const label = localizeCategoryName(c, tCatalog);
          return (
            <Link key={c.id} href={href} className="kumbu-category-tile shrink-0 md:min-w-0">
              <CategoryTileVisual categoryId={c.id} categoryName={c.name} />
              <span className="kumbu-category-tile-label text-kumbu-foreground">{label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
