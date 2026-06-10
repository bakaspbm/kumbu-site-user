"use server";

import { syncCart } from "@/lib/site-data";
import { getServerSessionUserId } from "@/lib/server-auth";
import type { CartItem } from "@/types/store";

export async function syncCartAction(
  items: CartItem[],
): Promise<{ ok: true } | { ok: false }> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) return { ok: false };
    await syncCart(items);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
