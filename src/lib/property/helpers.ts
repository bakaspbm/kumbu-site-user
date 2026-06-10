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
  if (meta.bedrooms) out.push(`${meta.bedrooms} quartos`);
  if (meta.bathrooms) out.push(`${meta.bathrooms} WC`);
  if (meta.parking) out.push("Estacionamento");
  if (meta.areaSqm) out.push(`${meta.areaSqm} m2`);
  return out;
}
