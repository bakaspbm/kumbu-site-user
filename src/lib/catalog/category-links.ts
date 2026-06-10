import { isJobCategory } from "@/lib/jobs/category";
import { isPropertyCategory } from "@/lib/property/category";
import type { CatalogCategory } from "@/types/store";

/** URL para explorar uma categoria (produtos, imóveis ou emprego). */
export function getCategoryExploreHref(category: Pick<CatalogCategory, "id" | "name">): string {
  if (category.id === "emprego") return "/emprego";
  return `/store-category/${category.id}?name=${encodeURIComponent(category.name)}`;
}

export type ExploreCategorySection = {
  key: "products" | "stays" | "jobs";
  title: string;
  categories: CatalogCategory[];
};

/** Agrupa categorias para a página Explorar (secções legíveis). */
export function partitionCategoriesForExplore(
  categories: CatalogCategory[],
): ExploreCategorySection[] {
  const products: CatalogCategory[] = [];
  const stays: CatalogCategory[] = [];
  const jobs: CatalogCategory[] = [];

  for (const c of categories) {
    if (isJobCategory(c)) jobs.push(c);
    else if (isPropertyCategory(c)) stays.push(c);
    else products.push(c);
  }

  const sections: ExploreCategorySection[] = [];
  if (products.length > 0) {
    sections.push({ key: "products", title: "Produtos à venda", categories: products });
  }
  if (stays.length > 0) {
    sections.push({ key: "stays", title: "Imóveis e arrendamento", categories: stays });
  }
  if (jobs.length > 0) {
    sections.push({ key: "jobs", title: "Emprego e vagas", categories: jobs });
  }
  return sections;
}
