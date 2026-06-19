import type { ConversationMessage } from "@/types/store";

function messageTime(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : 0;
}

function sortMessages(messages: ConversationMessage[]): ConversationMessage[] {
  return [...messages].sort((a, b) => messageTime(a.createdAt) - messageTime(b.createdAt));
}

/** Junta mensagens do servidor com pendentes locais (optimistic UI). */
export function mergeConversationMessages(
  local: ConversationMessage[],
  server: ConversationMessage[],
): ConversationMessage[] {
  if (server.length === 0) return local;

  const byId = new Map<string, ConversationMessage>();
  for (const m of server) byId.set(m.id, m);

  for (const m of local) {
    if (!m.id.startsWith("pending-")) continue;
    const confirmed = server.some(
      (s) => s.senderId === m.senderId && s.body === m.body,
    );
    if (!confirmed) byId.set(m.id, m);
  }

  return sortMessages(Array.from(byId.values()));
}

/** Confirma envio: substitui pending ou acrescenta se o poll já removeu o pending. */
export function confirmSentMessage(
  local: ConversationMessage[],
  tempId: string,
  confirmed: ConversationMessage,
): ConversationMessage[] {
  const withoutPending = local.filter((m) => m.id !== tempId);
  if (withoutPending.some((m) => m.id === confirmed.id)) {
    return sortMessages(withoutPending);
  }
  return sortMessages([...withoutPending, confirmed]);
}
