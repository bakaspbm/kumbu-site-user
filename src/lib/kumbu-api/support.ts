import { getKumbuApiClient, type KumbuApiClient } from "@/lib/kumbu-api/client";

export type SupportQuickAction = {
  id: string;
  label: string;
  escalate?: boolean;
};

export type SupportConversation = {
  id: string;
  supportStatus: string;
  welcomeMessage: string;
  quickActions: SupportQuickAction[];
  updatedAt: string;
};

export type SupportMessage = {
  id: string;
  conversationId?: string;
  senderId?: string;
  body: string;
  createdAt: string;
  messageKind?: string | null;
  fromSupport?: boolean;
};

function clientOrThrow(): KumbuApiClient {
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  return client;
}

function mapMessage(row: Record<string, unknown>): SupportMessage {
  return {
    id: String(row.id),
    conversationId:
      row.conversationId != null
        ? String(row.conversationId)
        : row.conversation_id != null
          ? String(row.conversation_id)
          : undefined,
    senderId:
      row.senderId != null
        ? String(row.senderId)
        : row.sender_id != null
          ? String(row.sender_id)
          : undefined,
    body: String(row.body ?? ""),
    createdAt: String(row.createdAt ?? row.created_at ?? new Date().toISOString()),
    messageKind:
      row.messageKind != null
        ? String(row.messageKind)
        : row.message_kind != null
          ? String(row.message_kind)
          : null,
    fromSupport: Boolean(row.fromSupport ?? row.from_support),
  };
}

export async function getSupportConversationBackend(): Promise<SupportConversation> {
  const client = clientOrThrow();
  const row = await client.request<Record<string, unknown>>("/support/conversation", { auth: true });
  return {
    id: String(row.id),
    supportStatus: String(row.supportStatus ?? row.support_status ?? "bot"),
    welcomeMessage: String(row.welcomeMessage ?? row.welcome_message ?? ""),
    quickActions: Array.isArray(row.quickActions ?? row.quick_actions)
      ? ((row.quickActions ?? row.quick_actions) as SupportQuickAction[])
      : [],
    updatedAt: String(row.updatedAt ?? row.updated_at ?? new Date().toISOString()),
  };
}

export async function listSupportMessagesBackend(): Promise<SupportMessage[]> {
  const client = clientOrThrow();
  const rows = await client.request<Record<string, unknown>[]>("/support/conversation/messages", {
    auth: true,
  });
  return rows.map(mapMessage);
}

export async function sendSupportMessageBackend(body: string): Promise<SupportMessage[]> {
  const client = clientOrThrow();
  const rows = await client.request<Record<string, unknown>[]>("/support/conversation/messages", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ body }),
  });
  return rows.map(mapMessage);
}

export async function sendSupportQuickActionBackend(actionId: string): Promise<SupportMessage[]> {
  const client = clientOrThrow();
  const rows = await client.request<Record<string, unknown>[]>("/support/conversation/quick-action", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ action_id: actionId }),
  });
  return rows.map(mapMessage);
}

export async function fetchPlatformSupportSettings(): Promise<{
  welcomeMessage: string;
  quickActions: SupportQuickAction[];
}> {
  const client = getKumbuApiClient();
  if (!client) {
    return { welcomeMessage: "Olá! Como podemos ajudar?", quickActions: [] };
  }
  const row = await client.request<Record<string, unknown>>("/platform/support-settings", {
    auth: false,
  });
  return {
    welcomeMessage: String(row.welcome_message ?? ""),
    quickActions: Array.isArray(row.quick_actions) ? (row.quick_actions as SupportQuickAction[]) : [],
  };
}
