"use client";

import Link from "next/link";
import {
  Briefcase,
  Car,
  Home,
  LayoutGrid,
  Shirt,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { getCategoryExploreHref } from "@/lib/catalog/category-links";
import { localizeCategoryName } from "@/lib/catalog/localize-catalog";
import type { CatalogCategory } from "@/types/store";

const iconById: Record<string, typeof LayoutGrid> = {
  eletronicos: Smartphone,
  telemoveis: Smartphone,
  moda: Shirt,
  eletrodomesticos: UtensilsCrossed,
  beleza: Sparkles,
  moveis: Home,
  carros: Car,
  servicos: Wrench,
  imoveis: Home,
  emprego: Briefcase,
  empregos: Briefcase,
};

export function CategoryChips({ categories }: { categories: CatalogCategory[] }) {
  const tCatalog = useTranslations("catalog");

  if (categories.length === 0) return null;

  return (
    <div className="kumbu-container pb-2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((c) => {
          const Icon = iconById[c.id] ?? LayoutGrid;
          const href = getCategoryExploreHref(c);
          return (
            <Link
              key={c.id}
              href={href}
              className="kumbu-category-tile min-w-0 md:aspect-auto"
            >
              <span className="kumbu-category-tile-icon">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
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
