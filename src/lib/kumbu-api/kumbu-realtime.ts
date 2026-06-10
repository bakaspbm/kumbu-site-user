"use client";

import { Client, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import { getKumbuApiClient } from "@/lib/kumbu-api/client";
import { touchPresenceBackend } from "@/lib/kumbu-api/presence";
import { getKumbuWsEndpoint } from "@/lib/kumbu-api/ws-url";
import type { ConversationMessage, UserNotification } from "@/types/store";

if (typeof globalThis !== "undefined" && !(globalThis as { global?: unknown }).global) {
  (globalThis as { global: typeof globalThis }).global = globalThis;
}

export type RealtimeStatus = "off" | "connecting" | "live" | "error";

export type NotificationPushEvent = {
  type: "new" | "sync";
  notification?: UserNotification | null;
  unreadCount?: number | null;
};

export type ChatPushEvent = {
  type: "new";
  message: ConversationMessage;
};

type StatusListener = (status: RealtimeStatus) => void;
type NotificationListener = (event: NotificationPushEvent) => void;
type ChatListener = (event: ChatPushEvent) => void;
type TopicListener = (message: ConversationMessage) => void;

let client: Client | null = null;
let connectGeneration = 0;
let status: RealtimeStatus = "off";

const statusListeners = new Set<StatusListener>();
const notificationListeners = new Set<NotificationListener>();
const userMessageListeners = new Set<ChatListener>();
const topicListeners = new Map<string, Set<TopicListener>>();

let notificationsSub: StompSubscription | null = null;
let userMessagesSub: StompSubscription | null = null;
const topicSubs = new Map<string, StompSubscription>();

function setStatus(next: RealtimeStatus) {
  status = next;
  for (const listener of statusListeners) listener(next);
}

function getAccessToken(): string | null {
  return getKumbuApiClient()?.getAccessToken() ?? null;
}

function mapNotification(raw: Record<string, unknown>): UserNotification {
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    body: String(raw.body ?? ""),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    iconKey: raw.iconKey != null ? String(raw.iconKey) : null,
    readAt: raw.readAt != null ? String(raw.readAt) : null,
    actionUrl: raw.actionUrl != null ? String(raw.actionUrl) : null,
  };
}

function mapNotificationEvent(raw: unknown): NotificationPushEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const type = row.type === "new" || row.type === "sync" ? row.type : null;
  if (!type) return null;
  const notificationRaw = row.notification;
  return {
    type,
    unreadCount: row.unreadCount == null ? null : Number(row.unreadCount),
    notification:
      notificationRaw && typeof notificationRaw === "object"
        ? mapNotification(notificationRaw as Record<string, unknown>)
        : null,
  };
}

function mapChatMessage(raw: unknown): ConversationMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = row.id != null ? String(row.id) : "";
  const conversationId = row.conversationId != null ? String(row.conversationId) : "";
  const senderId = row.senderId != null ? String(row.senderId) : "";
  if (!id || !conversationId || !senderId) return null;
  return {
    id,
    conversationId,
    senderId,
    body: String(row.body ?? ""),
    createdAt: String(row.createdAt ?? new Date().toISOString()),
    messageKind: row.messageKind === "system" ? "system" : "text",
  };
}

function mapChatPushEvent(raw: unknown): ChatPushEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (row.type !== "new") return null;
  const message = mapChatMessage(row.message);
  if (!message) return null;
  return { type: "new", message };
}

function teardownSubscriptions() {
  notificationsSub?.unsubscribe();
  userMessagesSub?.unsubscribe();
  for (const sub of topicSubs.values()) sub.unsubscribe();
  notificationsSub = null;
  userMessagesSub = null;
  topicSubs.clear();
}

function wireSubscriptions() {
  if (!client?.connected) return;

  if (notificationListeners.size > 0 && !notificationsSub) {
    notificationsSub = client.subscribe("/user/queue/notifications", (message) => {
      try {
        const parsed = mapNotificationEvent(JSON.parse(message.body));
        if (parsed) {
          for (const listener of notificationListeners) listener(parsed);
        }
      } catch {
        /* ignore malformed payloads */
      }
    });
  }

  if (userMessageListeners.size > 0 && !userMessagesSub) {
    userMessagesSub = client.subscribe("/user/queue/messages", (message) => {
      try {
        const parsed = mapChatPushEvent(JSON.parse(message.body));
        if (parsed) {
          for (const listener of userMessageListeners) listener(parsed);
        }
      } catch {
        /* ignore malformed payloads */
      }
    });
  }

  for (const [conversationId, listeners] of topicListeners) {
    if (listeners.size === 0 || topicSubs.has(conversationId)) continue;
    topicSubs.set(
      conversationId,
      client.subscribe(`/topic/chat/${conversationId}`, (message) => {
        try {
          const parsed = mapChatMessage(JSON.parse(message.body));
          if (!parsed) return;
          const set = topicListeners.get(conversationId);
          if (!set) return;
          for (const listener of set) listener(parsed);
        } catch {
          /* ignore malformed payloads */
        }
      }),
    );
  }
}

function applyConnectHeaders(stompClient: Client): boolean {
  const token = getAccessToken();
  if (!token) return false;
  stompClient.connectHeaders = { Authorization: `Bearer ${token}` };
  return true;
}

function ensureClient(): Client | null {
  const endpoint = getKumbuWsEndpoint();
  if (!endpoint || !getAccessToken()) {
    setStatus("off");
    return null;
  }

  if (client?.active) return client;

  if (client) {
    void client.deactivate();
    client = null;
    teardownSubscriptions();
  }

  setStatus("connecting");
  const generation = ++connectGeneration;

  client = new Client({
    reconnectDelay: 5_000,
    heartbeatIncoming: 20_000,
    heartbeatOutgoing: 20_000,
    webSocketFactory: () => new SockJS(endpoint),
    beforeConnect: () => {
      if (!applyConnectHeaders(client!)) {
        throw new Error("Sessão expirada");
      }
    },
    onConnect: () => {
      if (generation !== connectGeneration) return;
      setStatus("live");
      wireSubscriptions();
      void touchPresenceBackend().catch(() => {});
    },
    onStompError: () => {
      if (generation !== connectGeneration) return;
      setStatus("error");
    },
    onWebSocketClose: () => {
      if (generation !== connectGeneration) return;
      setStatus("error");
      teardownSubscriptions();
    },
    onDisconnect: () => {
      if (generation !== connectGeneration) return;
      setStatus("off");
      teardownSubscriptions();
    },
  });

  client.activate();
  return client;
}

export function getKumbuRealtimeStatus(): RealtimeStatus {
  return status;
}

export function onKumbuRealtimeStatus(listener: StatusListener): () => void {
  statusListeners.add(listener);
  listener(status);
  ensureClient();
  return () => {
    statusListeners.delete(listener);
    maybeDisconnect();
  };
}

export function subscribeNotificationsRealtime(options: {
  onEvent: NotificationListener;
  onStatus?: (status: RealtimeStatus) => void;
}): () => void {
  notificationListeners.add(options.onEvent);
  const unsubStatus = options.onStatus
    ? onKumbuRealtimeStatus(options.onStatus)
    : null;
  ensureClient();
  if (client?.connected) wireSubscriptions();

  return () => {
    notificationListeners.delete(options.onEvent);
    unsubStatus?.();
    if (notificationsSub && notificationListeners.size === 0) {
      notificationsSub.unsubscribe();
      notificationsSub = null;
    }
    maybeDisconnect();
  };
}

export function subscribeUserMessages(listener: ChatListener): () => void {
  userMessageListeners.add(listener);
  ensureClient();
  if (client?.connected) wireSubscriptions();

  return () => {
    userMessageListeners.delete(listener);
    if (userMessagesSub && userMessageListeners.size === 0) {
      userMessagesSub.unsubscribe();
      userMessagesSub = null;
    }
    maybeDisconnect();
  };
}

export function subscribeConversationTopic(
  conversationId: string,
  listener: TopicListener,
): () => void {
  let set = topicListeners.get(conversationId);
  if (!set) {
    set = new Set();
    topicListeners.set(conversationId, set);
  }
  set.add(listener);
  ensureClient();
  if (client?.connected) wireSubscriptions();

  return () => {
    const listeners = topicListeners.get(conversationId);
    if (!listeners) return;
    listeners.delete(listener);
    if (listeners.size === 0) {
      topicListeners.delete(conversationId);
      const sub = topicSubs.get(conversationId);
      sub?.unsubscribe();
      topicSubs.delete(conversationId);
    }
    maybeDisconnect();
  };
}

function maybeDisconnect() {
  if (
    statusListeners.size > 0 ||
    notificationListeners.size > 0 ||
    userMessageListeners.size > 0 ||
    topicListeners.size > 0
  ) {
    return;
  }
  connectGeneration += 1;
  if (client) {
    void client.deactivate();
    client = null;
  }
  teardownSubscriptions();
  setStatus("off");
}

export function disconnectKumbuRealtime() {
  connectGeneration += 1;
  statusListeners.clear();
  notificationListeners.clear();
  userMessageListeners.clear();
  topicListeners.clear();
  if (client) {
    void client.deactivate();
    client = null;
  }
  teardownSubscriptions();
  setStatus("off");
}
