/**
 * Offline vehicle brand→model catalog from VehiclesDB (CC-BY 4.0).
 * Regenerar: `python scripts/gen-vehiclesdb-catalog.py`
 * Attribution: Vehicle data by VehiclesDB (https://vehiclesdb.com)
 */
import catalogJson from "./vehiclesdb-catalog.json";

export type VehicleCatalogKind = "cars" | "motos" | "comerciais";

export type VehicleCatalogSlice = {
  brands: string[];
  modelsByBrand: Record<string, string[]>;
};

export type VehiclesDbCatalog = {
  source: string;
  sourceUrl: string;
  license: string;
  version: string;
  attribution: string;
  cars: VehicleCatalogSlice;
  comerciais: VehicleCatalogSlice;
  motos: VehicleCatalogSlice;
};

export const VEHICLES_DB_CATALOG = catalogJson as VehiclesDbCatalog;

export function resolveVehicleCatalogKind(
  categoryId: string,
  subcategoryId: string | null | undefined,
): VehicleCatalogKind | null {
  if (categoryId !== "carros") return null;
  const sub = (subcategoryId ?? "").toLowerCase();
  if (sub === "motas") return "motos";
  if (sub === "comerciais") return "comerciais";
  if (sub === "pecas") return null;
  return "cars";
}

function findBrandKey(slice: VehicleCatalogSlice, brand: string): string | null {
  const needle = brand.trim().toLowerCase();
  if (!needle) return null;
  for (const name of slice.brands) {
    if (name.toLowerCase() === needle) return name;
  }
  const starts = slice.brands.filter((name) => name.toLowerCase().startsWith(needle));
  if (starts.length === 1) return starts[0];
  return null;
}

export function getVehicleBrands(kind: VehicleCatalogKind): readonly string[] {
  return VEHICLES_DB_CATALOG[kind].brands;
}

export function getVehicleModelsForBrand(
  kind: VehicleCatalogKind,
  brand: string,
): readonly string[] {
  const slice = VEHICLES_DB_CATALOG[kind];
  const key = findBrandKey(slice, brand);
  if (!key) return [];
  return slice.modelsByBrand[key] ?? [];
}

export function vehiclesDbAttribution(): string {
  return VEHICLES_DB_CATALOG.attribution;
}
