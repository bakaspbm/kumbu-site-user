"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Headphones } from "lucide-react";
import { BackHeader } from "@/components/layout/back-header";
import { ChatComposer } from "@/components/messages/chat-composer";
import { ChatMessageBubble } from "@/components/messages/chat-message-bubble";
import { GuestSupportIntro } from "@/components/support/guest-support-intro";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useAuth } from "@/contexts/auth-context";
import { playMessageNotificationSound } from "@/lib/chat/notification-sound";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";
import { subscribeConversationTopic } from "@/lib/kumbu-api/kumbu-realtime";
import { uploadChatAttachmentAction } from "@/app/actions/chat-upload";
import {
  getGuestSupportSessionBackend,
  getSupportConversationBackend,
  listGuestSupportMessagesBackend,
  listSupportMessagesBackend,
  sendGuestSupportMessageBackend,
  sendGuestSupportQuickActionBackend,
  sendSupportMessageBackend,
  sendSupportQuickActionBackend,
  type SupportConversation,
  type SupportMessage,
  type SupportQuickAction,
} from "@/lib/kumbu-api/support";
import {
  readGuestSupportSession,
  type GuestSupportSession,
} from "@/lib/support/guest-session";
import type { ConversationMessage } from "@/types/store";

const POLL_MS = 20_000;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}

function fromRealtimeMessage(msg: ConversationMessage): SupportMessage {
  return {
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    body: msg.body,
    createdAt: msg.createdAt,
    messageKind: msg.messageKind ?? null,
    attachmentUrl: msg.attachmentUrl ?? null,
    fromSupport: msg.fromSupport ?? false,
  };
}

function mergeSupportMessages(prev: SupportMessage[], incoming: SupportMessage[]): SupportMessage[] {
  if (incoming.length === 0) return prev;
  const ids = new Set(prev.map((m) => m.id));
  const next = [...prev];
  for (const msg of incoming) {
    if (!ids.has(msg.id)) next.push(msg);
  }
  return next.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function guestSessionToConversation(session: GuestSupportSession): SupportConversation {
  return {
    id: session.id,
    supportStatus: session.supportStatus,
    welcomeMessage: session.welcomeMessage,
    quickActions: session.quickActions,
    updatedAt: session.updatedAt,
  };
}

export function SupportChatRoom() {
  const t = useTranslations("support");
  const tCommon = useTranslations("common");
  const formatErrorMessage = useFormatErrorMessage();
  const { user, isLoading: authLoading } = useAuth();
  const [guestSessionActive, setGuestSessionActive] = useState(false);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [attachBusy, setAttachBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newReplyBanner, setNewReplyBanner] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const guestSessionActiveRef = useRef(false);

  const isGuestMode = guestSessionActive && !user;

  useEffect(() => {
    conversationIdRef.current = conversation?.id ?? null;
  }, [conversation?.id]);

  useEffect(() => {
    userIdRef.current = user?.id ?? null;
  }, [user?.id]);

  useEffect(() => {
    guestSessionActiveRef.current = guestSessionActive;
  }, [guestSessionActive]);

  const scrollBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const appendMessages = useCallback(
    (incoming: SupportMessage[], options?: { notify?: boolean }) => {
      if (incoming.length === 0) return;
      setMessages((prev) => {
        const merged = mergeSupportMessages(prev, incoming);
        const hadNewSupport = incoming.some(
          (m) => m.fromSupport && !prev.some((p) => p.id === m.id),
        );
        if (hadNewSupport && options?.notify) {
          const latest = incoming.filter((m) => m.fromSupport).at(-1);
          if (latest) {
            playMessageNotificationSound();
            setNewReplyBanner(latest.body || t("newSupportReply"));
            window.setTimeout(() => setNewReplyBanner(null), 6000);
          }
        }
        return merged;
      });
      scrollBottom();
    },
    [scrollBottom, t],
  );

  const refreshMessages = useCallback(async () => {
    if (guestSessionActiveRef.current && !userIdRef.current) {
      const msgs = await listGuestSupportMessagesBackend();
      appendMessages(msgs);
      return msgs;
    }
    const msgs = await listSupportMessagesBackend();
    appendMessages(msgs);
    return msgs;
  }, [appendMessages]);

  const loadGuestChat = useCallback(async () => {
    const session = await getGuestSupportSessionBackend();
    const msgs = await listGuestSupportMessagesBackend();
    setGuestSessionActive(true);
    setConversation(guestSessionToConversation(session));
    setMessages(msgs);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      let cancelled = false;
      void (async () => {
        try {
          const conv = await getSupportConversationBackend();
          const msgs = await listSupportMessagesBackend();
          if (!cancelled) {
            setGuestSessionActive(false);
            setConversation(conv);
            setMessages(msgs);
          }
        } catch (err) {
          if (!cancelled) setError(formatErrorMessage(err));
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }

    let cancelled = false;
    void (async () => {
      const stored = await readGuestSupportSession();
      if (cancelled) return;
      if (!stored.hasSession) {
        setLoading(false);
        return;
      }
      try {
        await loadGuestChat();
      } catch {
        if (!cancelled) setGuestSessionActive(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, formatErrorMessage, loadGuestChat]);

  useEffect(() => {
    scrollBottom();
  }, [messages, scrollBottom]);

  useEffect(() => {
    if (!conversation?.id) return;

    const handleIncoming = (msg: ConversationMessage) => {
      if (msg.conversationId !== conversation.id) return;
      if (!guestSessionActiveRef.current && msg.senderId === userIdRef.current && !msg.fromSupport) {
        return;
      }
      appendMessages([fromRealtimeMessage(msg)], { notify: true });
    };

    const unsubTopic = subscribeConversationTopic(conversation.id, handleIncoming);

    const poll = window.setInterval(() => {
      void refreshMessages().catch(() => {});
    }, POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshMessages().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      unsubTopic();
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [conversation?.id, appendMessages, refreshMessages]);

  async function handleQuickAction(action: SupportQuickAction) {
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const responses = isGuestMode
        ? await sendGuestSupportQuickActionBackend(null, action.id)
        : await sendSupportQuickActionBackend(action.id);
      appendMessages(responses);
      if (action.escalate && conversation) {
        setConversation({ ...conversation, supportStatus: "waiting_admin" });
      }
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  async function handleSend(attachmentUrl?: string | null) {
    const trimmed = text.trim();
    if ((!trimmed && !attachmentUrl) || sending) return;
    setSending(true);
    setError(null);
    setText("");
    try {
      const responses = isGuestMode
        ? await sendGuestSupportMessageBackend(null, trimmed)
        : await sendSupportMessageBackend(trimmed, attachmentUrl);
      appendMessages(responses);
      const escalated = responses.some(
        (m) => m.fromSupport && m.body.toLowerCase().includes("agente"),
      );
      if (escalated && conversation) {
        setConversation({ ...conversation, supportStatus: "waiting_admin" });
      }
    } catch (err) {
      setError(formatErrorMessage(err));
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }

  async function handleAttach(file: File) {
    if (isGuestMode || sending || attachBusy) return;
    setAttachBusy(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadChatAttachmentAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await handleSend(result.url);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setAttachBusy(false);
    }
  }

  function handleGuestReady(_session: GuestSupportSession) {
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        await loadGuestChat();
      } catch (err) {
        setError(formatErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }

  const waitingHuman =
    conversation?.supportStatus === "waiting_admin" ||
    conversation?.supportStatus === "assigned";

  const showIntro = !authLoading && !user && !guestSessionActive && !loading && !conversation;

  return (
    <>
      <BackHeader title={t("chatTitle")} href="/support" />
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col bg-kumbu-page-bg">
        {showIntro ? (
          <GuestSupportIntro onReady={handleGuestReady} />
        ) : (
          <>
            <div className="border-b border-kumbu-border bg-kumbu-surface px-4 py-3">
              <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-kumbu-primary-soft text-kumbu-primary">
                    <Headphones className="size-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-kumbu-foreground">{t("chatTitle")}</p>
                    <p className="text-xs text-kumbu-muted">
                      {isGuestMode
                        ? t("guestModeHint")
                        : waitingHuman
                          ? t("waitingTeam")
                          : t("autoAssistant")}
                    </p>
                  </div>
                </div>
                {isGuestMode ? (
                  <Link
                    href="/login?next=/support/chat"
                    className="shrink-0 text-xs font-semibold text-kumbu-primary hover:underline"
                  >
                    {t("guestLogin")}
                  </Link>
                ) : null}
              </div>
            </div>

            {newReplyBanner ? (
              <div
                className="border-b border-kumbu-primary/20 bg-kumbu-primary/10 px-4 py-2.5 text-center text-xs font-semibold text-kumbu-foreground"
                role="status"
              >
                {newReplyBanner}
              </div>
            ) : null}

            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden">
              {loading ? (
                <div className="p-4">
                  <LoadingIndicator
                    active={loading}
                    label={t("loading")}
                    rotatingLabels={[t("loadingHintAssistant"), t("loadingHintTeam")]}
                    slowHint={tCommon("loadingSlowHint")}
                  />
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                    {messages.map((msg) => {
                      const isSystem = msg.messageKind === "system";
                      const mine = isGuestMode
                        ? !msg.fromSupport && !isSystem
                        : !msg.fromSupport && user?.id === msg.senderId;
                      return (
                        <ChatMessageBubble
                          key={msg.id}
                          body={msg.body}
                          time={formatTime(msg.createdAt)}
                          mine={mine}
                          system={isSystem}
                          attachmentUrl={msg.attachmentUrl}
                        />
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  {conversation && conversation.quickActions.length > 0 && !waitingHuman && (
                    <div className="border-t border-kumbu-border bg-kumbu-surface/80 px-4 py-3">
                      <p className="mb-2 text-xs font-semibold text-kumbu-muted">{t("faq")}</p>
                      <div className="flex flex-wrap gap-2">
                        {conversation.quickActions.map((action) => (
                          <button
                            key={action.id}
                            type="button"
                            disabled={sending}
                            onClick={() => void handleQuickAction(action)}
                            className="rounded-full border border-kumbu-border bg-kumbu-surface px-3 py-1.5 text-xs font-semibold text-kumbu-foreground transition hover:border-kumbu-primary/30 hover:bg-kumbu-primary-soft disabled:opacity-50"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {error && (
                    <p className="px-4 pb-2 text-center text-xs text-red-600" role="alert">
                      {error}
                    </p>
                  )}

                  <ChatComposer
                    value={text}
                    onChange={setText}
                    onSubmit={() => void handleSend()}
                    onAttach={isGuestMode ? undefined : (file) => void handleAttach(file)}
                    disabled={loading}
                    sending={sending}
                    attachBusy={attachBusy}
                    placeholder={t("typeMessage")}
                    hint={isGuestMode ? t("guestComposerHint") : t("composerHint")}
                    attachAriaLabel={t("attachFile")}
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
