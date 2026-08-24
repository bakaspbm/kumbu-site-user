"""Build slim VehiclesDB offline catalog for Kumbú publish form (CC-BY 4.0).

Source: https://github.com/vehiclesdb/vehiclesdb
Attribution required: Vehicle data by VehiclesDB (https://vehiclesdb.com)
"""
from __future__ import annotations

import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "src" / "lib" / "catalog" / "vehicles"
OUT_DIR.mkdir(parents=True, exist_ok=True)

CDN = "https://cdn.jsdelivr.net/gh/vehiclesdb/vehiclesdb@latest/dist/vehicles.min.json"

ANGOLA_CAR_PRIORITY = [
    "Toyota",
    "Hyundai",
    "Kia",
    "Nissan",
    "Mitsubishi",
    "Suzuki",
    "Honda",
    "Ford",
    "Volkswagen",
    "Mercedes-Benz",
    "BMW",
    "Land Rover",
    "Isuzu",
    "Chevrolet",
    "Renault",
    "Peugeot",
    "JAC",
    "Chery",
    "Geely",
    "Great Wall",
    "Haval",
    "Foton",
    "BYD",
    "Mazda",
    "Dacia",
    "Audi",
    "Lexus",
    "Jeep",
    "Subaru",
    "Opel",
    "Fiat",
    "Volvo",
    "MG",
    "Dongfeng",
    "BAIC",
    "Changan",
    "Jetour",
]

ANGOLA_MOTO_PRIORITY = [
    "Honda",
    "Yamaha",
    "Suzuki",
    "Bajaj",
    "TVS",
    "Kawasaki",
    "Haojue",
    "Lifan",
    "Kymco",
    "Piaggio",
    "Vespa",
    "BMW",
    "CFMoto",
    "Shineray",
    "Dayun",
    "Keeway",
    "Zontes",
    "Benelli",
    "SYM",
]


def sort_brands(names: list[str], priority: list[str]) -> list[str]:
    by = {n.casefold(): n for n in names}
    out: list[str] = []
    seen: set[str] = set()

    def add(name: str) -> None:
        k = name.casefold()
        if k in seen:
            return
        seen.add(k)
        out.append(by.get(k, name))

    for p in priority:
        # exact or startswith match in catalog
        hit = by.get(p.casefold())
        if hit:
            add(hit)
            continue
        for n in names:
            if n.casefold().startswith(p.casefold()) or p.casefold() in n.casefold():
                add(n)
                break
    for n in sorted(names, key=str.casefold):
        add(n)
    return out


def build_maps(data: dict) -> dict[str, dict[str, list[str]]]:
    # makes: [slug, name, kinds[]]
    # models: [make_slug, model_slug, model_name, kind, body?]
    make_name = {row[0]: row[1] for row in data["makes"]}
    buckets: dict[str, dict[str, set[str]]] = {
        "car": {},
        "motorcycle": {},
        "moped": {},
        "van": {},
        "truck": {},
    }
    for row in data["models"]:
        make_slug, _mslug, model_name, kind = row[0], row[1], row[2], row[3]
        if kind not in buckets:
            continue
        brand = make_name.get(make_slug) or make_slug
        buckets[kind].setdefault(brand, set()).add(str(model_name))

    result: dict[str, dict[str, list[str]]] = {}
    for kind, brands in buckets.items():
        result[kind] = {
            brand: sorted(models, key=str.casefold) for brand, models in brands.items()
        }
    return result


def main() -> None:
    print("Downloading", CDN)
    req = urllib.request.Request(CDN, headers={"User-Agent": "kumbu-gen-vehicles"})
    raw = urllib.request.urlopen(req, timeout=120).read()
    data = json.loads(raw)
    version = data.get("v") or data.get("version") or "unknown"
    maps = build_maps(data)

    cars = maps["car"]
    # comerciais: vans + trucks brands/models merged
    comerciais: dict[str, set[str]] = {}
    for kind in ("van", "truck"):
        for brand, models in maps[kind].items():
            comerciais.setdefault(brand, set()).update(models)
    comerciais_sorted = {
        b: sorted(ms, key=str.casefold) for b, ms in comerciais.items()
    }

    motos: dict[str, set[str]] = {}
    for kind in ("motorcycle", "moped"):
        for brand, models in maps[kind].items():
            motos.setdefault(brand, set()).update(models)
    motos_sorted = {b: sorted(ms, key=str.casefold) for b, ms in motos.items()}

    car_brands = sort_brands(list(cars.keys()), ANGOLA_CAR_PRIORITY)
    comercial_brands = sort_brands(list(comerciais_sorted.keys()), ANGOLA_CAR_PRIORITY)
    moto_brands = sort_brands(list(motos_sorted.keys()), ANGOLA_MOTO_PRIORITY)

    catalog = {
        "source": "VehiclesDB",
        "sourceUrl": "https://vehiclesdb.com",
        "license": "CC-BY-4.0",
        "version": version,
        "attribution": "Vehicle data by VehiclesDB (https://vehiclesdb.com)",
        "cars": {
            "brands": car_brands,
            "modelsByBrand": {b: cars[b] for b in car_brands if b in cars},
        },
        "comerciais": {
            "brands": comercial_brands,
            "modelsByBrand": {
                b: comerciais_sorted[b] for b in comercial_brands if b in comerciais_sorted
            },
        },
        "motos": {
            "brands": moto_brands,
            "modelsByBrand": {b: motos_sorted[b] for b in moto_brands if b in motos_sorted},
        },
    }

    out_json = OUT_DIR / "vehiclesdb-catalog.json"
    out_json.write_text(json.dumps(catalog, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    size_kb = out_json.stat().st_size / 1024
    print(
        f"wrote {out_json} ({size_kb:.1f} KB) "
        f"cars={len(car_brands)} motos={len(moto_brands)} comerciais={len(comercial_brands)} v={version}"
    )

    index_ts = '''/**
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
  // ligeiros, suv, or category default
  return "cars";
}

function findBrandKey(slice: VehicleCatalogSlice, brand: string): string | null {
  const needle = brand.trim().casefold?.() ?? brand.trim().toLowerCase();
  if (!needle) return null;
  for (const name of slice.brands) {
    if (name.toLowerCase() === needle) return name;
  }
  for (const name of slice.brands) {
    if (name.toLowerCase().includes(needle) || needle.includes(name.toLowerCase())) {
      return name;
    }
  }
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
'''
    # Fix Python generating invalid TS - casefold doesn't exist in JS
    index_ts = '''/**
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
  for (const name of slice.brands) {
    const n = name.toLowerCase();
    if (n.includes(needle) || needle.includes(n)) return name;
  }
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
'''
    (OUT_DIR / "index.ts").write_text(index_ts, encoding="utf-8")
    print("wrote index.ts")


if __name__ == "__main__":
    main()
