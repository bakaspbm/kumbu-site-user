"use server";

import { loadChatRoomServer } from "@/lib/chat/load-chat-room-server";
import {
  serverConversationNotFoundError,
  serverLoadConversationsError,
  serverLoginRequiredError,
  serverMarkReadError,
  serverSendMessageError,
  serverViewConversationLoginError,
} from "@/lib/i18n/server-errors";
import {
  countUnreadMessagesForUser,
  getConversationForUser,
  listConversationMessages,
  markConversationRead,
  listMyConversations,
  sendConversationMessage,
} from "@/lib/site-data";
import { getServerSessionUserId } from "@/lib/server-auth";
import type { ConversationMessage, ConversationSummary } from "@/types/store";

export type ConversationsListResult =
  | { ok: true; conversations: ConversationSummary[] }
  | { ok: false; error: string; needsLogin?: boolean };

export async function countUnreadMessagesAction(): Promise<number> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) return 0;
    const conversations = await listMyConversations();
    return conversations.reduce((sum, item) => sum + (item.unreadCount ?? 0), 0);
  } catch {
    return 0;
  }
}

export async function listConversationsAction(): Promise<ConversationsListResult> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) {
      return { ok: false, error: await serverLoginRequiredError(), needsLogin: true };
    }
    const conversations = await listMyConversations();
    return { ok: true, conversations };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : await serverLoadConversationsError();
    return { ok: false, error: message };
  }
}

export type ChatRoomDataResult =
  | {
      ok: true;
      conversation: ConversationSummary;
      messages: ConversationMessage[];
    }
  | { ok: false; error: string; needsLogin?: boolean };

export async function loadChatRoomAction(
  conversationId: string,
): Promise<ChatRoomDataResult> {
  const data = await loadChatRoomServer(conversationId);
  if (data.needsLogin) {
    return {
      ok: false,
      error: await serverViewConversationLoginError(),
      needsLogin: true,
    };
  }
  if (!data.conversation) {
    return {
      ok: false,
      error: data.error ?? (await serverConversationNotFoundError()),
    };
  }
  return { ok: true, conversation: data.conversation, messages: data.messages };
}

export type SendChatMessageResult =
  | { ok: true; message: ConversationMessage }
  | { ok: false; error: string; needsLogin?: boolean };

export async function listConversationMessagesAction(
  conversationId: string,
): Promise<ConversationMessage[]> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) return [];
    return await listConversationMessages(conversationId);
  } catch {
    return [];
  }
}

export async function markConversationReadAction(
  conversationId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) return { ok: false, error: await serverLoginRequiredError() };
    await markConversationRead(conversationId);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : await serverMarkReadError();
    return { ok: false, error: msg };
  }
}

export async function sendChatMessageAction(
  conversationId: string,
  body: string,
  attachmentUrl?: string | null,
): Promise<SendChatMessageResult> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) {
      return { ok: false, error: await serverLoginRequiredError(), needsLogin: true };
    }
    const message = await sendConversationMessage(conversationId, body, undefined, userId, {
      attachmentUrl,
    });
    return { ok: true, message };
  } catch (e) {
    const msg = e instanceof Error ? e.message : await serverSendMessageError();
    return { ok: false, error: msg };
  }
}
