import {
  IMOVEIS_CATEGORY_IDS,
  isImoveisCategoryName,
  isSaleOnlyProperty,
} from "@/lib/property/constants";
import type { CatalogCategory, CatalogProduct } from "@/types/store";
import type { PropertyMeta } from "@/types/property";

export function isPropertyCategory(
  category: CatalogCategory | undefined | null,
): boolean {
  if (!category) return false;
  if (category.kind === "property" || category.kind === "stay") return true;
  if (IMOVEIS_CATEGORY_IDS.includes(category.id as (typeof IMOVEIS_CATEGORY_IDS)[number])) {
    return true;
  }
  return isImoveisCategoryName(category.name);
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
