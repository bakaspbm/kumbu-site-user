"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { BackHeader } from "@/components/layout/back-header";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { ProductCard } from "@/components/store/product-card";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { useOfflineCategory } from "@/hooks/use-offline-category";
import {
  localizeCategoryName,
  localizeSubcategoryName,
} from "@/lib/catalog/localize-catalog";
import { isJobCategory } from "@/lib/jobs/category";
import { isPropertyCategory } from "@/lib/property/category";
import { demoCategories } from "@/lib/store/demo-data";
import type { SortMode } from "@/types/store";
import { cn } from "@/lib/utils";

interface CategoryPageClientProps {
  categoryId: string;
  categoryName: string;
  subcategoryId?: string;
  sortMode?: SortMode;
}

export function CategoryPageClient({
  categoryId,
  categoryName,
  subcategoryId,
  sortMode = "default",
}: CategoryPageClientProps) {
  const t = useTranslations("catalog");
  const tCommon = useTranslations("common");
  const { products, subcategories, loading } = useOfflineCategory({
    categoryId,
    subcategoryId,
    sortMode,
  });

  const categoryMeta = demoCategories.find((c) => c.id === categoryId);
  const categoryForLabel = categoryMeta ?? { id: categoryId, name: categoryName };
  const displayName = localizeCategoryName(categoryForLabel, t);
  const showSubcategories =
    subcategories.length > 0 &&
    categoryMeta &&
    !isPropertyCategory(categoryMeta) &&
    !isJobCategory(categoryMeta);

  function emptyCategoryMessage(): string {
    if (isJobCategory(categoryMeta)) return t("emptyJobs");
    if (categoryId === "empregos" || categoryId === "emprego") return t("emptyJobs");
    if (isPropertyCategory(categoryMeta)) return t("emptyProperty");
    if (categoryId === "imoveis") return t("emptyProperty");
    if (categoryId === "servicos") return t("emptyServices");
    return t("emptyDefault");
  }

  if (loading) return <PageSkeleton />;

  return (
    <article className="min-h-full pb-8">
      <OfflineBanner />
      <BackHeader title={displayName} />

      {showSubcategories && (
        <nav
          className="kumbu-container border-b border-kumbu-border py-3"
          aria-label={t("subcategoriesAria")}
        >
          <p className="flex gap-2 overflow-x-auto scrollbar-none">
            <Link
              href={`/store-category/${categoryId}?name=${encodeURIComponent(displayName)}`}
              prefetch
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors",
                !subcategoryId
                  ? "bg-kumbu-primary text-white shadow-sm"
                  : "bg-kumbu-secondary text-kumbu-muted hover:text-kumbu-foreground",
              )}
            >
              {tCommon("all")}
            </Link>
            {subcategories.map((s) => (
              <Link
                key={s.id}
                href={`/store-category/${categoryId}?name=${encodeURIComponent(displayName)}&sub=${s.id}`}
                prefetch
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors",
                  subcategoryId === s.id
                    ? "bg-kumbu-primary text-white shadow-sm"
                    : "bg-kumbu-secondary text-kumbu-muted hover:text-kumbu-foreground",
                )}
              >
                {localizeSubcategoryName(categoryId, s, t)}
              </Link>
            ))}
          </p>
        </nav>
      )}

      <ul className="kumbu-listing-grid kumbu-container mt-6">
        {products.length === 0 ? (
          <li className="col-span-full kumbu-card py-16 text-center text-sm text-kumbu-muted">
            {emptyCategoryMessage()}
          </li>
        ) : (
          products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} variant="grid" />
            </li>
          ))
        )}
      </ul>
    </article>
  );
}
