import type { Metadata } from "next";
import { CategoryPageClient } from "@/components/store/category-page-client";
import { buildCategoryMetadata } from "@/lib/seo/metadata";
import { demoCategories } from "@/lib/store/demo-data";
import { listCatalogCategories } from "@/lib/site-data";
import type { SortMode } from "@/types/store";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string; sort?: string; sub?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const sp = await searchParams;
  let categoryName = sp.name ? decodeURIComponent(sp.name) : "Categoria";

  try {
    const categories = await listCatalogCategories();
    const match = categories.find((c) => c.id === id);
    if (match) categoryName = match.name;
  } catch {
    const demo = demoCategories.find((c) => c.id === id);
    if (demo) categoryName = demo.name;
  }

  return buildCategoryMetadata(categoryName, id);
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
