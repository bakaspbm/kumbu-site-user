"""Generate brand list modules for publish forms."""
from __future__ import annotations

import json
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "lib" / "catalog" / "brands"
OUT.mkdir(parents=True, exist_ok=True)


def titleish(name: str) -> str:
    parts = name.replace("/", " / ").split()
    out = []
    for w in parts:
        if w in {"/", "&"} or (w.isupper() and len(w) <= 3):
            out.append(w)
        else:
            out.append(w[:1].upper() + w[1:].lower() if w else w)
    return " ".join(out)


def write_ts(filename: str, const_name: str, brands: list[str], comment: str) -> None:
    body = (
        f"/** {comment} */\n"
        f"export const {const_name}: readonly string[] = "
        f"{json.dumps(brands, ensure_ascii=False, indent=2)} as const;\n"
    )
    (OUT / filename).write_text(body, encoding="utf-8")
    print(f"wrote {filename} ({len(brands)})")


def unique_merge(priority: list[str], rest: list[str]) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()

    def add(x: str) -> None:
        k = x.casefold().strip()
        if not k or k in seen:
            return
        seen.add(k)
        out.append(x.strip())

    for x in priority:
        add(x)
    for x in sorted(rest, key=str.casefold):
        add(x)
    return out


def main() -> None:
    url = (
        "https://gist.githubusercontent.com/pimatco/"
        "64aec435e2a0abeeac8f30e24f918c11/raw/carbrands.json"
    )
    raw = urllib.request.urlopen(url, timeout=30).read().decode("utf-8")
    data = json.loads(raw)
    gist_names = []
    for row in data:
        n = str(row.get("name", "")).strip()
        if n:
            gist_names.append(titleish(n))

    # Prefer nicer casing for common names present in gist
    preferred = {
        "bmw": "BMW",
        "gmc": "GMC",
        "mg": "MG",
        "ktm": "KTM",
        "byd": "BYD",
        "jac": "JAC",
        "faw": "FAW",
        "ds automobiles": "DS Automobiles",
        "mercedes-benz": "Mercedes-Benz",
        "land rover": "Land Rover",
        "rolls-royce": "Rolls-Royce",
        "ssc north america": "SSC North America",
        "alfa romeo": "Alfa Romeo",
        "aston martin": "Aston Martin",
        "great wall / changcheng": "Great Wall / Changcheng",
        "saic-gm-wuling": "SAIC-GM-Wuling",
        "ssangyong": "SsangYong",
        "volkswagen": "Volkswagen",
    }
    normalized = []
    for n in gist_names:
        preferred_name = preferred.get(n.casefold(), n)
        normalized.append(preferred_name)

    angola_priority = [
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
        "Great Wall / Changcheng",
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
        "Omoda",
        "GAC Group",
        "Sinotruk",
        "Howo",
    ]
    cars = unique_merge(angola_priority, normalized)
    write_ts(
        "car-brands.ts",
        "CAR_BRANDS",
        cars,
        "Car brands from https://gist.github.com/pimatco/64aec435e2a0abeeac8f30e24f918c11 (+ Angola priority).",
    )

    moto = unique_merge(
        [
            "Honda",
            "Yamaha",
            "Suzuki",
            "Kawasaki",
            "Bajaj",
            "TVS",
            "Hero",
            "Haojue",
            "Lifan",
            "Kymco",
            "Piaggio",
            "Vespa",
            "BMW",
            "Harley-Davidson",
            "Ducati",
            "KTM",
            "Royal Enfield",
            "Triumph",
            "CFMoto",
            "Zontes",
            "Keeway",
            "Shineray",
            "Dayun",
            "Jialing",
            "Senke",
            "Loncin",
            "Aprilia",
            "Benelli",
            "Indian",
            "Husqvarna",
            "GasGas",
            "MV Agusta",
            "Moto Guzzi",
            "SYM",
            "Peugeot",
            "Gilera",
            "Sanyang",
            "Outra",
        ],
        [],
    )
    write_ts(
        "moto-brands.ts",
        "MOTO_BRANDS",
        moto,
        "Motorcycle / scooter brands common in Angola and worldwide.",
    )

    phones = unique_merge(
        [
            "Samsung",
            "Apple",
            "Xiaomi",
            "Huawei",
            "Tecno",
            "Infinix",
            "Itel",
            "Oppo",
            "Vivo",
            "Realme",
            "Nokia",
            "Motorola",
            "OnePlus",
            "Google",
            "Honor",
            "Sony",
            "LG",
            "Nothing",
            "Asus",
            "ZTE",
            "Alcatel",
            "Cubot",
            "Doogee",
            "Umidigi",
            "Blackview",
            "Outra",
        ],
        [],
    )
    write_ts("phone-brands.ts", "PHONE_BRANDS", phones, "Smartphone brands.")

    computers = unique_merge(
        [
            "HP",
            "Dell",
            "Apple",
            "Lenovo",
            "Asus",
            "Acer",
            "Microsoft",
            "Samsung",
            "Huawei",
            "MSI",
            "Toshiba",
            "LG",
            "Chuwi",
            "Gigabyte",
            "Razer",
            "Alienware",
            "Outra",
        ],
        [],
    )
    write_ts("computer-brands.ts", "COMPUTER_BRANDS", computers, "Computer / laptop brands.")

    tablets = unique_merge(
        [
            "Apple",
            "Samsung",
            "Lenovo",
            "Huawei",
            "Xiaomi",
            "Amazon",
            "Microsoft",
            "Tecno",
            "Outra",
        ],
        [],
    )
    write_ts("tablet-brands.ts", "TABLET_BRANDS", tablets, "Tablet brands.")

    tv = unique_merge(
        [
            "Samsung",
            "LG",
            "Sony",
            "TCL",
            "Hisense",
            "Philips",
            "Panasonic",
            "Sharp",
            "Toshiba",
            "Xiaomi",
            "Skyworth",
            "JBL",
            "Bose",
            "Sony",
            "Outra",
        ],
        [],
    )
    write_ts("tv-audio-brands.ts", "TV_AUDIO_BRANDS", tv, "TV and audio brands.")

    gaming = unique_merge(
        [
            "Sony",
            "Microsoft",
            "Nintendo",
            "Steam Deck",
            "Asus",
            "Logitech",
            "Razer",
            "Outra",
        ],
        [],
    )
    write_ts("gaming-brands.ts", "GAMING_BRANDS", gaming, "Console / gaming brands.")

    appliances = unique_merge(
        [
            "Samsung",
            "LG",
            "Whirlpool",
            "Bosch",
            "Electrolux",
            "Philips",
            "Panasonic",
            "Hisense",
            "Midea",
            "Haier",
            "Brastemp",
            "Consul",
            "Teka",
            "Indesit",
            "Siemens",
            "Outra",
        ],
        [],
    )
    write_ts(
        "appliance-brands.ts",
        "APPLIANCE_BRANDS",
        appliances,
        "Home appliance brands.",
    )

    index = '''import { APPLIANCE_BRANDS } from "./appliance-brands";
import { CAR_BRANDS } from "./car-brands";
import { COMPUTER_BRANDS } from "./computer-brands";
import { GAMING_BRANDS } from "./gaming-brands";
import { MOTO_BRANDS } from "./moto-brands";
import { PHONE_BRANDS } from "./phone-brands";
import { TABLET_BRANDS } from "./tablet-brands";
import { TV_AUDIO_BRANDS } from "./tv-audio-brands";

export type BrandSuggestionKey =
  | "cars"
  | "motos"
  | "phones"
  | "computers"
  | "tablets"
  | "tvAudio"
  | "gaming"
  | "appliances";

const MAP: Record<BrandSuggestionKey, readonly string[]> = {
  cars: CAR_BRANDS,
  motos: MOTO_BRANDS,
  phones: PHONE_BRANDS,
  computers: COMPUTER_BRANDS,
  tablets: TABLET_BRANDS,
  tvAudio: TV_AUDIO_BRANDS,
  gaming: GAMING_BRANDS,
  appliances: APPLIANCE_BRANDS,
};

export function getBrandSuggestions(key: BrandSuggestionKey | undefined): readonly string[] {
  if (!key) return [];
  return MAP[key] ?? [];
}

export {
  APPLIANCE_BRANDS,
  CAR_BRANDS,
  COMPUTER_BRANDS,
  GAMING_BRANDS,
  MOTO_BRANDS,
  PHONE_BRANDS,
  TABLET_BRANDS,
  TV_AUDIO_BRANDS,
};
'''
    (OUT / "index.ts").write_text(index, encoding="utf-8")
    print("wrote index.ts")


if __name__ == "__main__":
    main()
