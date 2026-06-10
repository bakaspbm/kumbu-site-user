"use client";

import Link from "next/link";
import { BackHeader } from "@/components/layout/back-header";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { ProductCard } from "@/components/store/product-card";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { useOfflineCategory } from "@/hooks/use-offline-category";
import { isJobCategory } from "@/lib/jobs/category";
import { isPropertyCategory } from "@/lib/property/category";
import { demoCategories } from "@/lib/store/demo-data";
import type { SortMode } from "@/types/store";
import { cn } from "@/lib/utils";

function emptyCategoryMessage(categoryId: string): string {
  const cat = demoCategories.find((c) => c.id === categoryId);
  if (cat && isJobCategory(cat)) return "Nenhuma vaga nesta categoria.";
  if (cat && isPropertyCategory(cat)) return "Nenhum imóvel nesta categoria.";
  if (categoryId === "servicos") return "Nenhum serviço listado.";
  return "Nenhum anúncio nesta categoria.";
}

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
  const { products, subcategories, loading } = useOfflineCategory({
    categoryId,
    subcategoryId,
    sortMode,
  });

  const categoryMeta = demoCategories.find((c) => c.id === categoryId);
  const displayName = categoryMeta?.name ?? categoryName;
  const showSubcategories =
    subcategories.length > 0 &&
    categoryMeta &&
    !isPropertyCategory(categoryMeta) &&
    !isJobCategory(categoryMeta);

  if (loading) return <PageSkeleton />;

  return (
    <article className="min-h-full pb-8">
      <OfflineBanner />
      <BackHeader title={displayName} />

      {showSubcategories && (
        <nav
          className="kumbu-container border-b border-kumbu-border py-3"
          aria-label="Subcategorias"
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
              Todos
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
                {s.name}
              </Link>
            ))}
          </p>
        </nav>
      )}

      <ul className="kumbu-listing-grid kumbu-container mt-6">
        {products.length === 0 ? (
          <li className="col-span-full kumbu-card py-16 text-center text-sm text-kumbu-muted">
            {emptyCategoryMessage(categoryId)}
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
