"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  countUnreadMessagesAction,
  listConversationsAction,
  markConversationReadAction,
} from "@/app/actions/chat";
import { listMyConversations } from "@/lib/site-data";
import { playMessageNotificationSound } from "@/lib/chat/notification-sound";
import {
  onKumbuRealtimeStatus,
  subscribeUserMessages,
} from "@/lib/kumbu-api/kumbu-realtime";
import {
  countUnreadConversations,
  enrichConversationsWithUnread,
  markConversationSeen,
} from "@/lib/chat/unread-tracker";
import { promiseWithTimeoutFallback } from "@/lib/promise-timeout";
import { useAuth } from "@/contexts/auth-context";
import type { ConversationMessage, ConversationSummary } from "@/types/store";

interface MessagesContextValue {
  unreadCount: number;
  conversations: ConversationSummary[];
  conversationsReady: boolean;
  refreshUnread: () => Promise<void>;
  markRead: (conversationId: string) => Promise<void>;
  realtimeStatus: "off" | "live" | "polling";
  lastIncoming: ConversationMessage | null;
}

const MessagesContext = createContext<MessagesContextValue | null>(null);

const POLL_MESSAGES_MS = 25_000;
const POLL_LIGHT_MS = 90_000;
const POLL_REALTIME_FALLBACK_MS = 60_000;

function sumUnreadMessages(conversations: ConversationSummary[]): number {
  return conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
}

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const seenMessageKeysRef = useRef<Set<string> | null>(null);
  const refreshInFlightRef = useRef(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsReady, setConversationsReady] = useState(false);
  const [lastIncoming, setLastIncoming] = useState<ConversationMessage | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<"off" | "live" | "polling">("off");

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const refreshUnread = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      setConversations([]);
      setConversationsReady(true);
      return;
    }

    if (refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;

    try {
      const onMessagesRoute = pathnameRef.current.startsWith("/mensagens");
      const convsApi = await listMyConversations(undefined);
      const enriched = enrichConversationsWithUnread(user.id, convsApi);
      setConversations(enriched);
      setUnreadCount(sumUnreadMessages(enriched));

      if (!onMessagesRoute) return;

      const result = await promiseWithTimeoutFallback(
        listConversationsAction(),
        12_000,
        { ok: true as const, conversations: [] },
      );

      if (!result.ok) {
        setConversations([]);
        setUnreadCount(0);
        return;
      }

      const convs = result.conversations;
      const currentKeys = new Set<string>();

      for (const c of convs) {
        const msg = c.lastMessage;
        if (!msg) continue;
        const key = `${c.id}:${msg.id}`;
        currentKeys.add(key);

        if (msg.senderId === user.id) continue;

        if (seenMessageKeysRef.current !== null && !seenMessageKeysRef.current.has(key)) {
          const onChat =
            pathnameRef.current === `/mensagens/${c.id}` ||
            pathnameRef.current.startsWith(`/mensagens/${c.id}/`);
          if (!onChat) {
            playMessageNotificationSound();
            setLastIncoming(msg);
          }
        }
      }
      seenMessageKeysRef.current = currentKeys;

      setConversations(convs);
      const localUnread = countUnreadConversations(user.id, convs);
      const fromServer = sumUnreadMessages(convs);
      setUnreadCount(Math.max(localUnread, fromServer));
    } catch {
      setUnreadCount(0);
    } finally {
      refreshInFlightRef.current = false;
      setConversationsReady(true);
    }
  }, [user]);

  const markRead = useCallback(
    async (conversationId: string) => {
      if (!user) return;
      markConversationSeen(user.id, conversationId);
      setConversations((prev) => {
        const conv = prev.find((c) => c.id === conversationId);
        const delta = conv?.unreadCount ?? 0;
        if (delta > 0) {
          setUnreadCount((count) => Math.max(0, count - delta));
        }
        return prev.map((c) =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c,
        );
      });

      await promiseWithTimeoutFallback(
        markConversationReadAction(conversationId),
        6_000,
        { ok: false as const, error: "" },
      );
      void refreshUnread();
    },
    [user, refreshUnread],
  );

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setUnreadCount(0);
      setConversations([]);
      setConversationsReady(false);
      seenMessageKeysRef.current = null;
      return;
    }

    setConversationsReady(false);
    seenMessageKeysRef.current = null;
    void refreshUnread();

    const pollMs =
      realtimeStatus === "live"
        ? POLL_REALTIME_FALLBACK_MS
        : pathname.startsWith("/mensagens")
          ? POLL_MESSAGES_MS
          : POLL_LIGHT_MS;

    const poll = window.setInterval(() => {
      void refreshUnread();
    }, pollMs);

    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshUnread();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isLoggedIn, user, pathname, refreshUnread, realtimeStatus]);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      setRealtimeStatus("off");
      return;
    }

    const unsubStatus = onKumbuRealtimeStatus((s) => {
      setRealtimeStatus(s === "live" ? "live" : s === "off" ? "off" : "polling");
    });

    const unsubMessages = subscribeUserMessages((event) => {
      const msg = event.message;
      if (msg.senderId === user.id) return;

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("kumbu:chat-message", { detail: msg }),
        );
      }

      const onChat =
        pathnameRef.current === `/mensagens/${msg.conversationId}` ||
        pathnameRef.current.startsWith(`/mensagens/${msg.conversationId}/`);
      if (!onChat) {
        playMessageNotificationSound();
        setLastIncoming(msg);
        setUnreadCount((prev) => prev + 1);
      }
      void refreshUnread();
    });

    return () => {
      unsubStatus();
      unsubMessages();
      setRealtimeStatus("off");
    };
  }, [isLoggedIn, user?.id, refreshUnread]);

  const value = useMemo(
    () => ({
      unreadCount,
      conversations,
      conversationsReady,
      refreshUnread,
      markRead,
      realtimeStatus,
      lastIncoming,
    }),
    [
      unreadCount,
      conversations,
      conversationsReady,
      refreshUnread,
      markRead,
      realtimeStatus,
      lastIncoming,
    ],
  );

  return (
    <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>
  );
}

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) {
    throw new Error("useMessages deve ser usado dentro de MessagesProvider");
  }
  return ctx;
}
