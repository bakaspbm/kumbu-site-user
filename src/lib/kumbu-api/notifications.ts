import type { UserNotification } from "@/types/store";
import { getKumbuApiClient, type KumbuApiClient } from "@/lib/kumbu-api/client";

type NotificationDto = {
  id: string;
  title?: string | null;
  body?: string | null;
  createdAt?: string | null;
  iconKey?: string | null;
  readAt?: string | null;
  actionUrl?: string | null;
};

type CountDto = {
  count?: number | null;
};

function clientOrThrow(): KumbuApiClient {
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  return client;
}

function toNotification(row: NotificationDto): UserNotification {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    body: String(row.body ?? ""),
    createdAt: String(row.createdAt ?? new Date().toISOString()),
    iconKey: row.iconKey ?? null,
    readAt: row.readAt ?? null,
    actionUrl: row.actionUrl ?? null,
  };
}

export async function listNotificationsBackend(): Promise<UserNotification[]> {
  const client = clientOrThrow();
  const rows = await client.request<NotificationDto[]>("/notifications");
  return (rows ?? []).map(toNotification);
}

export async function countUnreadNotificationsBackend(): Promise<number> {
  const client = clientOrThrow();
  const row = await client.request<CountDto>("/notifications/unread-count");
  return Number(row.count ?? 0);
}

export async function getNotificationBackend(notificationId: string): Promise<UserNotification | null> {
  const rows = await listNotificationsBackend();
  return rows.find((item) => item.id === notificationId) ?? null;
}

export async function markNotificationReadBackend(notificationId: string): Promise<void> {
  const client = clientOrThrow();
  await client.request<void>(`/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: "POST",
  });
}
