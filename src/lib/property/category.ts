import { isImoveisCategory, isSaleOnlyProperty } from "@/lib/property/constants";
import type { CatalogCategory, CatalogProduct } from "@/types/store";
import type { PropertyMeta } from "@/types/property";

export function isPropertyCategory(
  category: CatalogCategory | undefined | null,
): boolean {
  if (!category) return false;
  return isImoveisCategory(category.id, category.kind, category.name);
}

/** Detecta imóvel mesmo se o objecto categoria ainda não estiver na lista. */
export function isPropertyCategoryId(categoryId?: string | null): boolean {
  return isImoveisCategory(categoryId);
}

export function isPropertyListing(product: CatalogProduct): boolean {
  return product.listingKind === "property" || Boolean(product.propertyMeta);
}

export function formatPropertyPrice(meta: PropertyMeta): string {
  const amt = meta.priceAmount;
  if (!amt || amt <= 0) return "";
  const formatted = new Intl.NumberFormat("pt-AO").format(amt);
  if (isSaleOnlyProperty(meta) || meta.listingIntent === "sale") {
    return `${formatted} Kz`;
  }
  if (meta.listingIntent === "rent" && meta.rentPeriod === "daily") {
    return `${formatted} Kz/noite`;
  }
  if (meta.listingIntent === "rent") return `${formatted} Kz/mês`;
  return `${formatted} Kz`;
}

export function buildLocationLabel(meta: PropertyMeta, fallback?: string | null): string {
  const parts = [meta.bairro, meta.municipality, meta.province].filter(Boolean);
  if (parts.length) return parts.join(", ");
  return fallback?.trim() || "Angola";
}
