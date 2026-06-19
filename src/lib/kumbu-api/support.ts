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
  attachmentUrl?: string | null;
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
    attachmentUrl:
      (row.attachmentUrl as string | null | undefined) ??
      (row.attachment_url as string | null | undefined) ??
      null,
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

export async function sendSupportMessageBackend(
  body: string,
  attachmentUrl?: string | null,
): Promise<SupportMessage[]> {
  const client = clientOrThrow();
  const payload: Record<string, string> = { body: body.trim() };
  if (attachmentUrl?.trim()) {
    payload.attachmentUrl = attachmentUrl.trim();
  }
  const rows = await client.request<Record<string, unknown>[]>("/support/conversation/messages", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
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

function mapGuestSession(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    accessToken: String(row.accessToken ?? row.access_token ?? ""),
    guestName: String(row.guestName ?? row.guest_name ?? ""),
    guestEmail: String(row.guestEmail ?? row.guest_email ?? ""),
    supportStatus: String(row.supportStatus ?? row.support_status ?? "bot"),
    welcomeMessage: String(row.welcomeMessage ?? row.welcome_message ?? ""),
    quickActions: Array.isArray(row.quickActions ?? row.quick_actions)
      ? ((row.quickActions ?? row.quick_actions) as SupportQuickAction[])
      : [],
    updatedAt: String(row.updatedAt ?? row.updated_at ?? new Date().toISOString()),
  };
}

function guestHeaders(token: string): Record<string, string> {
  return { "X-Guest-Support-Token": token };
}

async function guestProxyRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/support/guest-proxy/${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error("Resposta inválida do servidor.");
    }
  }
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as Record<string, unknown>).message)
        : `Erro HTTP ${response.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export async function openGuestSupportSessionBackend(name: string, email: string) {
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  const row = await client.request<Record<string, unknown>>("/support/guest/session", {
    method: "POST",
    auth: false,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim(), email: email.trim() }),
  });
  return mapGuestSession(row);
}

export async function getGuestSupportSessionBackend(token?: string | null) {
  if (typeof window !== "undefined") {
    const row = await guestProxyRequest<Record<string, unknown>>("support/guest/session");
    return mapGuestSession(row);
  }
  if (!token?.trim()) throw new Error("Token de convidado em falta.");
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  const row = await client.request<Record<string, unknown>>("/support/guest/session", {
    auth: false,
    headers: guestHeaders(token),
  });
  return mapGuestSession(row);
}

export async function listGuestSupportMessagesBackend(
  token?: string | null,
): Promise<SupportMessage[]> {
  if (typeof window !== "undefined") {
    const rows = await guestProxyRequest<Record<string, unknown>[]>("support/guest/messages");
    return rows.map(mapMessage);
  }
  if (!token?.trim()) throw new Error("Token de convidado em falta.");
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  const rows = await client.request<Record<string, unknown>[]>("/support/guest/messages", {
    auth: false,
    headers: guestHeaders(token),
  });
  return rows.map(mapMessage);
}

export async function sendGuestSupportMessageBackend(token: string | null | undefined, body: string) {
  if (typeof window !== "undefined") {
    const rows = await guestProxyRequest<Record<string, unknown>[]>("support/guest/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim() }),
    });
    return rows.map(mapMessage);
  }
  if (!token?.trim()) throw new Error("Token de convidado em falta.");
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  const rows = await client.request<Record<string, unknown>[]>("/support/guest/messages", {
    method: "POST",
    auth: false,
    headers: { ...guestHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ body: body.trim() }),
  });
  return rows.map(mapMessage);
}

export async function sendGuestSupportQuickActionBackend(
  token: string | null | undefined,
  actionId: string,
) {
  if (typeof window !== "undefined") {
    const rows = await guestProxyRequest<Record<string, unknown>[]>("support/guest/quick-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action_id: actionId }),
    });
    return rows.map(mapMessage);
  }
  if (!token?.trim()) throw new Error("Token de convidado em falta.");
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  const rows = await client.request<Record<string, unknown>[]>("/support/guest/quick-action", {
    method: "POST",
    auth: false,
    headers: { ...guestHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ action_id: actionId }),
  });
  return rows.map(mapMessage);
}
