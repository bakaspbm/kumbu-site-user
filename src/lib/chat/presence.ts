const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export type PresenceTranslator = (
  key:
    | "online"
    | "offline"
    | "seenNow"
    | "seenMinutes"
    | "seenHours"
    | "seenYesterday"
    | "seenDays"
    | "seenOn",
  values?: { count?: number; date?: string },
) => string;

export function isUserOnline(lastSeenAt: string | null | undefined): boolean {
  if (!lastSeenAt) return false;
  const ts = Date.parse(lastSeenAt);
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts <= ONLINE_WINDOW_MS;
}

export function formatUserPresence(
  online: boolean | undefined,
  lastSeenAt: string | null | undefined,
  t: PresenceTranslator,
  dateLocale = "pt-PT",
): string {
  if (online || isUserOnline(lastSeenAt)) {
    return t("online");
  }
  if (!lastSeenAt) {
    return t("offline");
  }

  const seen = Date.parse(lastSeenAt);
  if (Number.isNaN(seen)) {
    return t("offline");
  }

  const diffMs = Math.max(0, Date.now() - seen);
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return t("seenNow");
  if (diffMin < 60) return t("seenMinutes", { count: diffMin });

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return t("seenHours", { count: diffHours });

  const seenDate = new Date(seen);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (sameDay(seenDate, yesterday)) return t("seenYesterday");

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return t("seenDays", { count: diffDays });

  return t("seenOn", {
    date: seenDate.toLocaleDateString(dateLocale, {
      day: "numeric",
      month: "short",
    }),
  });
}
