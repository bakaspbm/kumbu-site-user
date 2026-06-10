"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ListingImage } from "@/components/ui/listing-image";
import { ChatComposer } from "@/components/messages/chat-composer";
import { ChatDealActions } from "@/components/messages/chat-deal-actions";
import { ChatMessageBubble } from "@/components/messages/chat-message-bubble";
import {
  loadChatRoomAction,
  listConversationMessagesAction,
  sendChatMessageAction,
} from "@/app/actions/chat";
import { formatUserPresence, isUserOnline } from "@/lib/chat/presence";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";
import { getConversationBackend } from "@/lib/kumbu-api/chat";
import { subscribeConversationTopic } from "@/lib/kumbu-api/kumbu-realtime";
import { markConversationSeen } from "@/lib/chat/unread-tracker";
import { promiseWithTimeout } from "@/lib/promise-timeout";
import { useAuth } from "@/contexts/auth-context";
import { useMessages } from "@/contexts/messages-context";
import type { ConversationMessage, ConversationSummary } from "@/types/store";

interface ChatRoomProps {
  conversationId: string;
  initialConversation?: ConversationSummary | null;
  initialMessages?: ConversationMessage[];
  initialError?: string | null;
  initialNeedsLogin?: boolean;
}

export function ChatRoom({
  conversationId,
  initialConversation = null,
  initialMessages = [],
  initialError = null,
  initialNeedsLogin = false,
}: ChatRoomProps) {
  const t = useTranslations("chat");
  const tPresence = useTranslations("chat.presence");
  const formatErrorMessage = useFormatErrorMessage();
  const locale = useLocale();
  const dateLocale = locale === "en" ? "en-US" : locale === "fr" ? "fr-FR" : "pt-PT";
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { markRead, refreshUnread, realtimeStatus } = useMessages();
  const hasServerData = initialConversation != null;
  const [presenceTick, setPresenceTick] = useState(0);

  const [conv, setConv] = useState<ConversationSummary | null>(initialConversation);
  const [messages, setMessages] = useState<ConversationMessage[]>(initialMessages);
  const [messagesLoading, setMessagesLoading] = useState(
    hasServerData && initialMessages.length === 0,
  );
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(!hasServerData && !initialError);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const formatTime = useCallback(
    (iso: string) =>
      new Date(iso).toLocaleTimeString(dateLocale, {
        hour: "2-digit",
        minute: "2-digit",
      }),
    [dateLocale],
  );

  const formatDayLabel = useCallback(
    (iso: string) => {
      const d = new Date(iso);
      const now = new Date();
      const sameDay =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();
      if (sameDay) return t("today");
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear()
      ) {
        return t("yesterday");
      }
      return d.toLocaleDateString(dateLocale, { day: "numeric", month: "long" });
    },
    [dateLocale, t],
  );

  const scrollBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (initialNeedsLogin) {
      router.replace(`/login?next=/mensagens/${conversationId}`);
    }
  }, [initialNeedsLogin, conversationId, router]);

  useEffect(() => {
    if (!user) return;
    markConversationSeen(user.id, conversationId);
    if (hasServerData) void markRead(conversationId);
  }, [hasServerData, conversationId, markRead, user]);

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    setMessagesLoading(true);
    try {
      const msgs = await promiseWithTimeout(
        listConversationMessagesAction(conversationId),
        20_000,
        t("loadMessagesFailed"),
      );
      setMessages(msgs);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("loadMessagesError"));
    } finally {
      setMessagesLoading(false);
    }
  }, [conversationId, t, user?.id]);

  useEffect(() => {
    if (!user || !conv) return;
    void fetchMessages();
  }, [conv?.id, user?.id, fetchMessages]);

  useEffect(() => {
    if (!user || !conv) return;

    const onGlobalPush = (event: Event) => {
      const msg = (event as CustomEvent<ConversationMessage>).detail;
      if (!msg || msg.conversationId !== conversationId) return;
      if (msg.senderId === user.id) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setMessagesLoading(false);
      void markRead(conversationId);
    };
    window.addEventListener("kumbu:chat-message", onGlobalPush);

    const unsub = subscribeConversationTopic(conversationId, (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        const withoutPending = prev.filter(
          (m) =>
            !(
              m.id.startsWith("pending-") &&
              m.senderId === msg.senderId &&
              m.body === msg.body
            ),
        );
        return [...withoutPending, msg];
      });
      setMessagesLoading(false);
      if (msg.senderId !== user.id) {
        void markRead(conversationId);
      }
    });

    const pollMs = realtimeStatus === "live" ? 60_000 : 5_000;
    const poll = () => {
      void listConversationMessagesAction(conversationId)
        .then((msgs) => {
          if (msgs.length === 0) return;
          setMessages((prev) => {
            const prevLast = prev[prev.length - 1]?.id;
            const nextLast = msgs[msgs.length - 1]?.id;
            if (prevLast === nextLast && prev.length === msgs.length) return prev;
            return msgs;
          });
          setMessagesLoading(false);
        })
        .catch(() => {});
    };

    const interval = window.setInterval(poll, pollMs);
    return () => {
      window.removeEventListener("kumbu:chat-message", onGlobalPush);
      unsub();
      window.clearInterval(interval);
    };
  }, [conversationId, user?.id, conv?.id, markRead, realtimeStatus]);

  useEffect(() => {
    if (!user || !conv) return;

    const refreshPresence = () => {
      void getConversationBackend(conversationId)
        .then((next) => {
          if (!next?.otherParty) return;
          setConv((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              otherParty: prev.otherParty
                ? {
                    ...prev.otherParty,
                    online: next.otherParty?.online,
                    lastSeenAt: next.otherParty?.lastSeenAt ?? null,
                  }
                : next.otherParty,
            };
          });
        })
        .catch(() => {});
    };

    refreshPresence();
    const interval = window.setInterval(refreshPresence, 30_000);
    return () => window.clearInterval(interval);
  }, [conversationId, user?.id, conv?.id]);

  useEffect(() => {
    if (!conv?.otherParty) return;
    const interval = window.setInterval(() => setPresenceTick((tick) => tick + 1), 60_000);
    return () => window.clearInterval(interval);
  }, [conv?.otherParty?.lastSeenAt, conv?.otherParty?.online]);

  const presenceLabel = useMemo(
    () =>
      formatUserPresence(
        conv?.otherParty?.online,
        conv?.otherParty?.lastSeenAt,
        tPresence,
        dateLocale,
      ),
    [conv?.otherParty?.online, conv?.otherParty?.lastSeenAt, presenceTick, tPresence, dateLocale],
  );

  useEffect(() => {
    if (hasServerData) return;
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setError(t("loginToViewConversation"));
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const result = await promiseWithTimeout(
          loadChatRoomAction(conversationId),
          20_000,
          t("chatLoadTimeout"),
        );
        if (cancelled) return;
        if (!result.ok) {
          if (result.needsLogin) {
            router.replace(`/login?next=/mensagens/${conversationId}`);
            return;
          }
          setError(result.error);
          return;
        }
        setConv(result.conversation);
        setMessages(result.messages);
        void markRead(conversationId);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("loadChatError"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasServerData, authLoading, user, conversationId, router, markRead, t]);

  useEffect(() => {
    scrollBottom();
  }, [messages, scrollBottom]);

  async function handleSend() {
    if (!text.trim() || sending || !user) return;

    const body = text.trim();
    const tempId = `pending-${Date.now()}`;
    const optimistic: ConversationMessage = {
      id: tempId,
      conversationId,
      senderId: user.id,
      body,
      createdAt: new Date().toISOString(),
    };

    setSending(true);
    setPendingId(tempId);
    setText("");
    setMessages((prev) => [...prev, optimistic]);
    setError(null);

    try {
      const result = await promiseWithTimeout(
        sendChatMessageAction(conversationId, body),
        60_000,
        t("sendTimeout"),
      );
      if (!result.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setText(body);
        if (result.needsLogin) {
          router.replace(`/login?next=/mensagens/${conversationId}`);
          return;
        }
        setError(result.error);
        return;
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? result.message : m)),
      );
      void refreshUnread();
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setText(body);
      setError(err instanceof Error ? err.message : formatErrorMessage(err));
    } finally {
      setPendingId(null);
      setSending(false);
    }
  }

  const searchParams = useSearchParams();
  const pedidosParam = searchParams.get("pedidos");
  const multiOrders =
    pedidosParam != null && Number(pedidosParam) > 1 ? Number(pedidosParam) : 0;

  const waitingAuth = authLoading && !hasServerData;
  if (waitingAuth || loading) {
    return <p className="py-12 text-center text-sm text-kumbu-muted">{t("loadingChat")}</p>;
  }

  if (!conv) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-red-400">{error ?? t("conversationUnavailable")}</p>
        <Link href="/mensagens" className="mt-4 inline-block text-sm font-semibold text-kumbu-primary">
          {t("backToMessages")}
        </Link>
      </div>
    );
  }

  const otherName = conv.otherParty?.displayName ?? t("defaultUser");
  const photo = conv.otherParty?.photoUrl;
  const otherOnline =
    isUserOnline(conv.otherParty?.lastSeenAt) || conv.otherParty?.online === true;
  let lastDay = "";

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col bg-gradient-to-b from-kumbu-secondary/30 to-kumbu-background md:min-h-[calc(100dvh-5rem)]">
      <header className="sticky top-0 z-10 border-b border-kumbu-border/80 bg-kumbu-surface/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-kumbu-primary-soft ring-2 ring-kumbu-surface">
            {photo ? (
              <ListingImage src={photo} alt="" fill />
            ) : (
              <span className="flex h-full items-center justify-center text-lg font-bold text-kumbu-primary">
                {otherName.charAt(0).toUpperCase()}
              </span>
            )}
            {otherOnline && (
              <span
                className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-kumbu-surface bg-emerald-500"
                aria-hidden
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-extrabold text-kumbu-foreground">{otherName}</p>
            <p className="flex items-center gap-1.5 text-xs text-kumbu-muted">
              {otherOnline && (
                <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
              )}
              {presenceLabel}
            </p>
          </div>
          {conv.productId && (
            <Link
              href={`/produto/${conv.productId}`}
              className="shrink-0 rounded-full bg-kumbu-primary-soft px-3 py-1.5 text-xs font-semibold text-kumbu-primary hover:bg-kumbu-primary/15"
            >
              {t("listingLink")}
            </Link>
          )}
        </div>
        {conv.productTitle && (
          <p className="mx-auto mt-2 max-w-2xl truncate text-center text-xs text-kumbu-muted">
            {conv.productTitle}
            {conv.productPriceLabel ? ` · ${conv.productPriceLabel}` : ""}
          </p>
        )}
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4 md:px-4">
        <div className="mx-auto max-w-2xl space-y-3">
          {multiOrders > 0 && (
            <p className="rounded-xl border border-kumbu-primary/20 bg-kumbu-primary/5 px-3 py-2 text-center text-xs text-kumbu-muted">
              {t("multiOrdersBefore", { count: multiOrders })}{" "}
              <Link href="/conta/compras" className="font-semibold text-kumbu-primary">
                {t("myPurchases")}
              </Link>
              {t("multiOrdersAfter")}
            </p>
          )}
          {messagesLoading && messages.length === 0 && (
            <p className="py-8 text-center text-sm text-kumbu-muted">{t("loading")}</p>
          )}
          {!messagesLoading && messages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-kumbu-border bg-kumbu-surface/60 px-4 py-8 text-center">
              <p className="text-sm font-medium text-kumbu-foreground">{t("startConversation")}</p>
              <p className="mt-1 text-xs text-kumbu-muted">{t("noMessages")}</p>
              <button
                type="button"
                onClick={() => void fetchMessages()}
                className="mt-3 text-xs font-semibold text-kumbu-primary hover:underline"
              >
                {t("refreshMessages")}
              </button>
            </div>
          )}
          {messages.map((m) => {
            const day = formatDayLabel(m.createdAt);
            const showDay = day !== lastDay;
            if (showDay) lastDay = day;
            const mine = m.senderId === user?.id;

            return (
              <div key={m.id}>
                {showDay && (
                  <p className="my-4 text-center text-[10px] font-semibold uppercase tracking-wide text-kumbu-muted">
                    {day}
                  </p>
                )}
                <ChatMessageBubble
                  body={m.body}
                  time={formatTime(m.createdAt)}
                  mine={mine}
                  pending={m.id === pendingId}
                  system={m.messageKind === "system"}
                />
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {error && (
        <p className="px-4 pb-1 text-center text-xs text-red-400" role="alert">
          {error}
        </p>
      )}

      {user && conv.productId && (
        <ChatDealActions
          conversation={conv}
          userId={user.id}
          onUpdated={(c, msgs) => {
            setConv(c);
            if (msgs?.length) setMessages(msgs);
            else void fetchMessages();
          }}
        />
      )}

      {!closedDeal(conv) && (
        <ChatComposer
          value={text}
          onChange={setText}
          onSubmit={() => void handleSend()}
          disabled={!user}
          sending={sending}
        />
      )}
    </div>
  );
}

function closedDeal(conv: ConversationSummary) {
  return conv.dealStatus === "purchased" || conv.dealStatus === "rejected";
}
