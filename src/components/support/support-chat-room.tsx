"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Headphones } from "lucide-react";
import { BackHeader } from "@/components/layout/back-header";
import { ChatComposer } from "@/components/messages/chat-composer";
import { ChatMessageBubble } from "@/components/messages/chat-message-bubble";
import { useAuth } from "@/contexts/auth-context";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";
import {
  getSupportConversationBackend,
  listSupportMessagesBackend,
  sendSupportMessageBackend,
  sendSupportQuickActionBackend,
  type SupportConversation,
  type SupportMessage,
  type SupportQuickAction,
} from "@/lib/kumbu-api/support";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}

export function SupportChatRoom() {
  const t = useTranslations("support");
  const formatErrorMessage = useFormatErrorMessage();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?next=/support/chat");
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const conv = await getSupportConversationBackend();
        const msgs = await listSupportMessagesBackend();
        if (!cancelled) {
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
  }, [authLoading, user, router, formatErrorMessage]);

  useEffect(() => {
    scrollBottom();
  }, [messages, scrollBottom]);

  async function appendResponses(responses: SupportMessage[]) {
    if (responses.length === 0) return;
    setMessages((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      const next = [...prev];
      for (const msg of responses) {
        if (!ids.has(msg.id)) next.push(msg);
      }
      return next;
    });
  }

  async function handleQuickAction(action: SupportQuickAction) {
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const responses = await sendSupportQuickActionBackend(action.id);
      await appendResponses(responses);
      if (action.escalate && conversation) {
        setConversation({ ...conversation, supportStatus: "waiting_admin" });
      }
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    setText("");
    try {
      const responses = await sendSupportMessageBackend(trimmed);
      await appendResponses(responses);
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

  const waitingHuman =
    conversation?.supportStatus === "waiting_admin" ||
    conversation?.supportStatus === "assigned";

  return (
    <>
      <BackHeader title={t("chatTitle")} href="/support" />
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col bg-kumbu-page-bg">
        <div className="border-b border-kumbu-border bg-kumbu-surface px-4 py-3">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-kumbu-primary-soft text-kumbu-primary">
              <Headphones className="size-5" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-bold text-kumbu-foreground">{t("chatTitle")}</p>
              <p className="text-xs text-kumbu-muted">
                {waitingHuman ? t("waitingTeam") : t("autoAssistant")}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col overflow-hidden">
          {loading ? (
            <p className="p-6 text-center text-sm text-kumbu-muted">{t("loading")}</p>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messages.map((msg) => {
                  const isSystem =
                    msg.messageKind === "system" ||
                    (msg.fromSupport && msg.messageKind !== "support");
                  const mine = !msg.fromSupport && user?.id === msg.senderId;
                  return (
                    <ChatMessageBubble
                      key={msg.id}
                      body={msg.body}
                      time={formatTime(msg.createdAt)}
                      mine={mine}
                      system={isSystem}
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
                disabled={loading}
                sending={sending}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
