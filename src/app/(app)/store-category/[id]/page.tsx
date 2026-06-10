import { CategoryPageClient } from "@/components/store/category-page-client";
import { demoCategories } from "@/lib/store/demo-data";
import type { SortMode } from "@/types/store";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string; sort?: string; sub?: string }>;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const name = sp.name ?? "Categoria";
  const sortMode = (sp.sort as SortMode) ?? "default";
  const subId = sp.sub;
  const categoryName =
    demoCategories.find((c) => c.id === id)?.name ?? decodeURIComponent(name);

  return (
    <CategoryPageClient
      categoryId={id}
      categoryName={categoryName}
      subcategoryId={subId}
      sortMode={sortMode}
    />
  );
}
