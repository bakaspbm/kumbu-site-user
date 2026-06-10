import type { ConversationSummary } from "@/types/store";

function storageKey(userId: string) {
  return `kumbu-chat-last-seen:${userId}`;
}

function readMap(userId: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function writeMap(userId: string, map: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(map));
  } catch {
  }
}

export function markConversationSeen(
  userId: string,
  conversationId: string,
  at: string = new Date().toISOString(),
) {
  const map = readMap(userId);
  map[conversationId] = at;
  writeMap(userId, map);
}

export function isConversationUnread(
  userId: string,
  conversation: ConversationSummary,
): boolean {
  const last = conversation.lastMessage;
  if (!last || last.senderId === userId) return false;

  const serverCount = conversation.unreadCount ?? 0;
  if (serverCount > 0) return true;

  const seenAt = readMap(userId)[conversation.id];
  if (!seenAt) return true;

  return new Date(last.createdAt).getTime() > new Date(seenAt).getTime();
}

export function countUnreadConversations(
  userId: string,
  conversations: ConversationSummary[],
): number {
  return conversations.filter((c) => isConversationUnread(userId, c)).length;
}

export function enrichConversationsWithUnread(
  userId: string,
  conversations: ConversationSummary[],
): ConversationSummary[] {
  return conversations.map((c) => ({
    ...c,
    unreadCount: isConversationUnread(userId, c) ? Math.max(c.unreadCount ?? 0, 1) : 0,
  }));
}
