"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ListingImage } from "@/components/ui/listing-image";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { enrichConversationsWithUnread } from "@/lib/chat/unread-tracker";
import { useAuth } from "@/contexts/auth-context";
import { useMessages } from "@/contexts/messages-context";
import type { ConversationSummary } from "@/types/store";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { cn } from "@/lib/utils";

function formatTime(iso: string, dateLocale: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (sameDay) {
      return d.toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString(dateLocale, { day: "2-digit", month: "short" });
  } catch {
    return "";
  }
}

export function ConversationList() {
  const t = useTranslations("chat");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const dateLocale = locale === "en" ? "en-US" : locale === "fr" ? "fr-FR" : "pt-PT";
  const { user } = useAuth();
  const {
    lastIncoming,
    refreshUnread,
    conversations: ctxConversations,
    conversationsReady,
  } = useMessages();
  const [items, setItems] = useState<ConversationSummary[]>([]);

  const applyList = useCallback(
    (convs: ConversationSummary[]) => {
      if (!user) {
        setItems(convs);
        return;
      }
      setItems(enrichConversationsWithUnread(user.id, convs));
    },
    [user],
  );

  useEffect(() => {
    if (!conversationsReady) return;
    applyList(ctxConversations);
  }, [ctxConversations, conversationsReady, applyList]);

  useEffect(() => {
    if (!lastIncoming || !user) return;

    let needRefresh = false;
    setItems((prev) => {
      const idx = prev.findIndex((c) => c.id === lastIncoming.conversationId);
      if (idx < 0) {
        needRefresh = true;
        return prev;
      }
      const updated = enrichConversationsWithUnread(user.id, [
        {
          ...prev[idx],
          lastMessage: lastIncoming,
          updatedAt: lastIncoming.createdAt,
        },
      ])[0];
      const rest = prev.filter((_, i) => i !== idx);
      return [updated, ...rest];
    });

    if (needRefresh) void refreshUnread();
  }, [lastIncoming, user, refreshUnread]);

  if (!conversationsReady) {
    return (
      <div className="px-4 py-8">
        <LoadingIndicator
          active
          label={t("loadingConversations")}
          slowHint={tCommon("loadingSlowHint")}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-4">
        <EmptyState
          icon={MessageCircle}
          title={t("noConversationsTitle")}
          description={t("noConversationsDesc")}
          steps={[t("emptyStep1"), t("emptyStep2"), t("emptyStep3")]}
          actionLabel={t("exploreListings")}
          actionHref="/procurar"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-3 py-3 md:px-4">
      <ul className="space-y-2">
        {items.map((c) => {
          const name = c.otherParty?.displayName ?? t("defaultUser");
          const preview = c.lastMessage?.body ?? t("noPreview");
          const time = c.lastMessage?.createdAt ?? c.updatedAt;
          const unread = (c.unreadCount ?? 0) > 0;

          return (
            <li key={c.id}>
              <Link
                href={`/mensagens/${c.id}`}
                className={cn(
                  "flex gap-3 rounded-2xl border p-3.5 transition-all",
                  unread
                    ? "border-kumbu-primary/30 bg-kumbu-primary-soft/50 shadow-sm"
                    : "border-kumbu-border bg-kumbu-surface hover:border-kumbu-primary/15 hover:bg-kumbu-secondary/50",
                )}
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-kumbu-surface-muted ring-1 ring-kumbu-border/60">
                  {c.productImageUrl ? (
                    <ListingImage src={c.productImageUrl} alt="" fill />
                  ) : (
                    <span className="flex h-full items-center justify-center text-lg font-bold text-kumbu-primary">
                      {name.charAt(0)}
                    </span>
                  )}
                  {unread && (
                    <span className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full bg-kumbu-primary ring-2 ring-kumbu-surface" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <p
                        className={cn(
                          "truncate",
                          unread ? "font-extrabold text-kumbu-foreground" : "font-bold",
                        )}
                      >
                        {name}
                      </p>
                      {c.otherParty?.sellerVerified ? <VerifiedBadge className="shrink-0" /> : null}
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-[11px] tabular-nums",
                        unread ? "font-semibold text-kumbu-primary" : "text-kumbu-muted",
                      )}
                    >
                      {formatTime(time, dateLocale)}
                    </span>
                  </div>
                  <p className="truncate text-xs text-kumbu-muted">{c.productTitle}</p>
                  <p
                    className={cn(
                      "mt-0.5 truncate text-sm",
                      unread ? "font-semibold text-kumbu-foreground" : "text-kumbu-muted",
                    )}
                  >
                    {preview}
                  </p>
                </div>
                {unread && (
                  <span className="flex min-w-[1.35rem] items-center justify-center self-center rounded-full bg-kumbu-primary px-2 py-1 text-[10px] font-bold text-white">
                    {(c.unreadCount ?? 0) > 9 ? "9+" : c.unreadCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
