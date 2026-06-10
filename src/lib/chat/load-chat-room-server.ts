import { getTranslations } from "next-intl/server";
import {
  getConversationForUser,
  listConversationMessages,
  markConversationRead,
} from "@/lib/site-data";
import type { ConversationMessage, ConversationSummary } from "@/types/store";

export type ChatRoomInitialData = {
  conversation: ConversationSummary | null;
  messages: ConversationMessage[];
  error: string | null;
  needsLogin: boolean;
};

export async function loadChatRoomServer(
  conversationId: string,
): Promise<ChatRoomInitialData> {
  const t = await getTranslations("errors");
  try {
    const [conversation, messages] = await Promise.all([
      getConversationForUser(conversationId),
      listConversationMessages(conversationId),
    ]);

    if (!conversation) {
      return {
        conversation: null,
        messages: [],
        error: t("conversationNotFound"),
        needsLogin: false,
      };
    }

    void markConversationRead(conversationId).catch(() => undefined);

    return { conversation, messages, error: null, needsLogin: false };
  } catch (e) {
    const tChat = await getTranslations("chat");
    return {
      conversation: null,
      messages: [],
      error: e instanceof Error ? e.message : tChat("loadChatError"),
      needsLogin: false,
    };
  }
}
