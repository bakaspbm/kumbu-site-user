"use server";

import { syncCart } from "@/lib/site-data";
import { formatErrorMessageServer } from "@/lib/i18n/format-error-server";
import { getServerSessionUserId } from "@/lib/server-auth";
import type { CartItem } from "@/types/store";

export async function syncCartAction(
  items: CartItem[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) {
      return { ok: false, error: "Inicie sessão para sincronizar o carrinho." };
    }
    await syncCart(items);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: await formatErrorMessageServer(err) };
  }
}
