import type { PropertyType } from "@/types/property";

export const LAND_PROPERTY_TYPES: PropertyType[] = [
  "terreno_vazio",
  "terreno_inacabado",
];

export function isLandPropertyType(type: PropertyType): boolean {
  return LAND_PROPERTY_TYPES.includes(type);
}

export function isSaleOnlyProperty(meta: { propertyType: PropertyType }): boolean {
  return isLandPropertyType(meta.propertyType);
}

export const PROPERTY_TYPES: PropertyType[] = [
  "casa",
  "apartamento",
  "hospedaria",
  "quarto",
  "hotel",
  "terreno_vazio",
  "terreno_inacabado",
];

export {
  ANGOLA_MUNICIPALITIES,
  ANGOLA_PROVINCES,
  formatAngolaLocation,
  listAngolaMunicipalities,
  listAngolaProvinces,
} from "@/lib/geo/angola-locations";

export const IMOVEIS_CATEGORY_IDS = ["imoveis"] as const;

const PROPERTY_CATEGORY_IDS = new Set([
  "imoveis",
  "imovel",
  "property",
  "realestate",
  "real-estate",
]);

export function isImoveisCategoryName(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes("imóv") || n.includes("imov") || n === "imoveis";
}

/** Detecta imóveis por id/kind/nome — mesmo se o objecto categoria ainda não carregou. */
export function isImoveisCategory(
  categoryId?: string | null,
  kind?: string,
  name?: string,
): boolean {
  const id = (categoryId ?? "").trim().toLowerCase();
  if (id && PROPERTY_CATEGORY_IDS.has(id)) return true;
  const k = (kind ?? "").trim().toLowerCase();
  if (k === "property" || k === "stay") return true;
  return Boolean(name?.trim()) && isImoveisCategoryName(name!);
}
