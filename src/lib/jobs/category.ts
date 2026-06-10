import { isEmpregoCategory } from "@/lib/jobs/constants";
import type { CatalogCategory, CatalogProduct } from "@/types/store";

export function isJobCategory(category: CatalogCategory | undefined | null): boolean {
  if (!category) return false;
  return isEmpregoCategory(category.id, category.kind, category.name);
}

export function isJobListing(product: CatalogProduct): boolean {
  return product.listingKind === "job" || Boolean(product.jobMeta);
}
