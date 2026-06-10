import type { CartItem } from "@/types/store";
import { parsePriceLabel } from "@/lib/utils";

export function cartTotalQuantity(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function formatCartTotalLabel(items: CartItem[]): string {
  let sum = 0;
  for (const item of items) {
    sum += parsePriceLabel(item.priceLabel) * item.quantity;
  }
  if (sum <= 0) return "0 Kz";
  const formatted =
    sum === Math.round(sum) ? Math.round(sum).toString() : sum.toFixed(2);
  return `${formatted} Kz`;
}

export function formatItemsTotalLabel(items: CartItem[]): string {
  return formatCartTotalLabel(items);
}

export function groupCartBySeller(items: CartItem[]): Map<string, CartItem[]> {
  const map = new Map<string, CartItem[]>();
  for (const item of items) {
    if (!item.sellerId) continue;
    const list = map.get(item.sellerId) ?? [];
    list.push(item);
    map.set(item.sellerId, list);
  }
  return map;
}
