"use server";

import {
  serverActionError,
  serverConversationNotFoundError,
  serverLoginRequiredError,
} from "@/lib/i18n/server-errors";
import {
  getConversationForUser,
  listConversationMessages,
  setConversationDeal,
} from "@/lib/site-data";
import { getServerSessionUserId } from "@/lib/server-auth";
import type { ConversationMessage, ConversationSummary } from "@/types/store";

export type SetDealResult =
  | {
      ok: true;
      conversation: ConversationSummary;
      messages: ConversationMessage[];
    }
  | { ok: false; error: string; needsLogin?: boolean };

export async function setConversationDealAction(
  conversationId: string,
  status: "purchased" | "rejected",
): Promise<SetDealResult> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) {
      return { ok: false, error: await serverLoginRequiredError(), needsLogin: true };
    }
    await setConversationDeal(conversationId, status);
    const [conversation, messages] = await Promise.all([
      getConversationForUser(conversationId),
      listConversationMessages(conversationId),
    ]);
    if (!conversation) {
      return { ok: false, error: await serverConversationNotFoundError() };
    }
    return { ok: true, conversation, messages };
  } catch (e) {
    return { ok: false, error: await serverActionError(e) };
  }
}
