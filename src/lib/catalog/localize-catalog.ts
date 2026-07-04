export type CatalogTranslateFn = (key: string) => string;

function tf(t: CatalogTranslateFn, key: string, fallback: string): string {
  try {
    const translated = t(key);
    if (
      !translated ||
      translated === key ||
      translated.startsWith("catalog.") ||
      translated.includes("MISSING_MESSAGE")
    ) {
      return fallback;
    }
    return translated;
  } catch {
    return fallback;
  }
}

export function localizeCategoryName(
  category: { id: string; name: string },
  t: CatalogTranslateFn,
): string {
  return tf(t, `categories.${category.id}`, category.name);
}

export function localizeSubcategoryName(
  categoryId: string,
  subcategory: { id: string; name: string },
  t: CatalogTranslateFn,
): string {
  return tf(t, `subcategories.${categoryId}_${subcategory.id}`, subcategory.name);
}

export function categoryMatchesLocalizedSearch(
  category: { id: string; name: string },
  query: string,
  t: CatalogTranslateFn,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (category.name.toLowerCase().includes(q)) return true;
  return localizeCategoryName(category, t).toLowerCase().includes(q);
}
