"use server";

import {
  serverLoginRequiredError,
  serverStartConversationError,
} from "@/lib/i18n/server-errors";
import { startConversation } from "@/lib/site-data";
import { getServerSessionUserId } from "@/lib/server-auth";

export type StartConversationResult =
  | { ok: true; conversationId: string }
  | { ok: false; error: string; needsLogin?: boolean };

export async function startConversationAction(
  productId: string,
  _sellerId: string,
): Promise<StartConversationResult> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) {
      return { ok: false, error: await serverLoginRequiredError(), needsLogin: true };
    }
    const conversationId = await startConversation(productId);
    return { ok: true, conversationId };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : await serverStartConversationError();
    return { ok: false, error: message };
  }
}
