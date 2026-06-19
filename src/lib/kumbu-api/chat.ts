import type { ConversationMessage, ConversationSummary } from "@/types/store";
import { getKumbuApiClient, type KumbuApiClient } from "@/lib/kumbu-api/client";

type ConversationDto = {
  id: string;
  productId: string;
  productTitle?: string | null;
  buyerId: string;
  sellerId: string;
  otherPartyId?: string | null;
  otherPartyName?: string | null;
  otherPartyVerified?: boolean | null;
  lastMessageBody?: string | null;
  lastMessageSenderId?: string | null;
  lastMessageAt?: string | null;
  updatedAt?: string | null;
  dealStatus?: string | null;
  dealStatusAt?: string | null;
  unreadCount?: number | null;
  otherPartyLastSeenAt?: string | null;
  otherPartyOnline?: boolean | null;
};

type MessageDto = {
  id: string;
  conversationId?: string;
  conversation_id?: string;
  senderId?: string;
  sender_id?: string;
  body: string;
  createdAt?: string;
  created_at?: string;
  messageKind?: string | null;
  message_kind?: string | null;
  attachmentUrl?: string | null;
  attachment_url?: string | null;
};

function clientOrThrow(): KumbuApiClient {
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  return client;
}

function coerceDate(value: string | null | undefined): string {
  if (value == null || value === "") return new Date().toISOString();
  return value;
}

function toMessage(row: MessageDto): ConversationMessage {
  const kind = row.messageKind ?? row.message_kind ?? "text";
  return {
    id: String(row.id),
    conversationId: String(row.conversationId ?? row.conversation_id ?? ""),
    senderId: String(row.senderId ?? row.sender_id ?? ""),
    body: String(row.body ?? ""),
    createdAt: coerceDate(row.createdAt ?? row.created_at),
    messageKind: kind === "system" ? "system" : kind === "attachment" ? "attachment" : "text",
    attachmentUrl: row.attachmentUrl ?? row.attachment_url ?? null,
  };
}

export function parseChatMessageRow(row: MessageDto): ConversationMessage {
  return toMessage(row);
}

function toConversation(row: ConversationDto): ConversationSummary {
  return {
    id: String(row.id),
    productId: String(row.productId),
    buyerId: String(row.buyerId),
    sellerId: String(row.sellerId),
    updatedAt: coerceDate(row.updatedAt),
    productTitle: row.productTitle ?? null,
    productPriceLabel: null,
    productImageUrl: null,
    otherParty: row.otherPartyId
      ? {
          id: String(row.otherPartyId),
          displayName: row.otherPartyName ?? "Utilizador",
          photoUrl: null,
          sellerVerified: row.otherPartyVerified === true,
          online: row.otherPartyOnline === true,
          lastSeenAt: row.otherPartyLastSeenAt ?? null,
        }
      : null,
    lastMessage: row.lastMessageBody
      ? {
          id: `last:${row.id}`,
          conversationId: String(row.id),
          senderId: row.lastMessageSenderId ? String(row.lastMessageSenderId) : "",
          body: row.lastMessageBody,
          createdAt: coerceDate(row.lastMessageAt ?? row.updatedAt),
          messageKind: "text",
        }
      : null,
    unreadCount: Math.max(0, Number(row.unreadCount ?? 0)),
    dealStatus:
      row.dealStatus === "open" || row.dealStatus === "purchased" || row.dealStatus === "rejected"
        ? row.dealStatus
        : null,
    dealStatusAt: row.dealStatusAt ?? null,
  };
}

export async function listConversationsBackend(): Promise<ConversationSummary[]> {
  const client = clientOrThrow();
  const rows = await client.request<ConversationDto[]>("/chat/conversations");
  return (rows ?? []).map(toConversation);
}

export async function getConversationBackend(conversationId: string): Promise<ConversationSummary | null> {
  const client = clientOrThrow();
  try {
    const row = await client.request<ConversationDto>(
      `/chat/conversations/${encodeURIComponent(conversationId)}`,
    );
    return toConversation(row);
  } catch {
    return null;
  }
}

export async function listConversationMessagesBackend(
  conversationId: string,
): Promise<ConversationMessage[]> {
  const client = clientOrThrow();
  const rows = await client.request<MessageDto[]>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
  );
  return (rows ?? []).map(toMessage);
}

export async function startConversationBackend(productId: string): Promise<string> {
  const client = clientOrThrow();
  const row = await client.request<ConversationDto>("/chat/conversations", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
  return String(row.id);
}

export async function sendConversationMessageBackend(
  conversationId: string,
  body: string,
  attachmentUrl?: string | null,
): Promise<ConversationMessage> {
  const client = clientOrThrow();
  const row = await client.request<MessageDto>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ body, attachmentUrl: attachmentUrl ?? undefined }),
    },
  );
  return toMessage(row);
}

export async function markConversationReadBackend(conversationId: string): Promise<void> {
  const client = clientOrThrow();
  await client.request<void>(`/chat/conversations/${encodeURIComponent(conversationId)}/read`, {
    method: "POST",
  });
}

export async function setConversationDealBackend(
  conversationId: string,
  status: "purchased" | "rejected",
): Promise<void> {
  const client = clientOrThrow();
  await client.request<void>(`/chat/conversations/${encodeURIComponent(conversationId)}/deal`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

export async function countUnreadMessagesBackend(): Promise<number> {
  const rows = await listConversationsBackend();
  return rows.reduce((sum, row) => sum + (row.unreadCount ?? 0), 0);
}
