import type { PropertyMeta } from "@/types/property";
import { eachNightDate } from "@/lib/property/dates";

export function occupiedNightSet(ranges: { checkIn: string; checkOut: string }[]): Set<string> {
  const occupied = new Set<string>();
  for (const range of ranges) {
    if (!range?.checkIn || !range?.checkOut) continue;
    for (const date of eachNightDate(range.checkIn, range.checkOut)) {
      occupied.add(date);
    }
  }
  return occupied;
}

export function propertyMetaSummary(meta: PropertyMeta | null | undefined): string[] {
  if (!meta) return [];
  const out: string[] = [];
  const pt = meta.propertyType;
  // Single room listings should not show "X quartos".
  if ((pt === "casa" || pt === "apartamento") && meta.bedrooms) {
    out.push(`${meta.bedrooms} quartos`);
  }
  if ((pt === "casa" || pt === "apartamento") && meta.bathrooms) {
    out.push(`${meta.bathrooms} WC`);
  }
  if ((pt === "hospedaria" || pt === "hotel") && meta.roomsCount) {
    out.push(`${meta.roomsCount} unidades`);
  }
  if (pt === "quarto" && meta.furnished) out.push("Mobilado");
  if (pt === "quarto" && meta.sharedBathroom) out.push("WC partilhada");
  if (pt === "quarto" && meta.sharedKitchen) out.push("Cozinha partilhada");
  if (meta.parking) out.push("Estacionamento");
  if (meta.areaSqm) out.push(`${meta.areaSqm} m2`);
  return out;
}
