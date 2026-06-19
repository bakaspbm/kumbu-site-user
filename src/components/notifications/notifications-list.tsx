"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bell, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { RequireAuth } from "@/components/auth/require-auth";
import { useAuth } from "@/contexts/auth-context";
import type { NotificationPushEvent } from "@/lib/kumbu-api/notifications-realtime";
import { listNotifications as listNotificationsUnified, markNotificationRead as markNotificationReadUnified } from "@/lib/site-data";
import type { UserNotification } from "@/types/store";
import { sanitizeAppLink } from "@/lib/urls/safe-link";
import { cn } from "@/lib/utils";

function previewBody(body: string | null | undefined, max = 100) {
  const flat = (body ?? "").replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max).trimEnd()}…`;
}

export function NotificationsList({
  detailHref = (id: string) => `/conta/notificacoes/${id}`,
}: {
  detailHref?: (id: string) => string;
}) {
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const { refreshNotifications, markNotificationReadLocal } = useAuth();
  const [items, setItems] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listNotificationsUnified();
      setItems(list);
      await refreshNotifications();
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [refreshNotifications]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (pathname === "/conta/notificacoes" || pathname === "/notifications") {
      void load();
    }
  }, [pathname, load]);

  useEffect(() => {
    function onPush(event: Event) {
      const detail = (event as CustomEvent<NotificationPushEvent>).detail;
      if (detail?.type === "new" && detail.notification) {
        setItems((prev) => {
          if (prev.some((item) => item.id === detail.notification!.id)) return prev;
          return [detail.notification!, ...prev];
        });
        return;
      }
      void load();
    }

    window.addEventListener("kumbu:notification-push", onPush);
    return () => window.removeEventListener("kumbu:notification-push", onPush);
  }, [load]);

  return (
    <RequireAuth>
      {loading ? (
        <div className="py-8">
          <LoadingIndicator
            active={loading}
            label={t("loading")}
            slowHint={tCommon("loadingSlowHint")}
          />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          steps={[t("emptyStep1"), t("emptyStep2"), t("emptyStep3")]}
          actionLabel={t("emptyAction")}
          actionHref="/procurar"
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((n) => {
            const href = sanitizeAppLink(n.actionUrl) ?? detailHref(n.id);
            return (
            <li key={n.id}>
              <Link
                href={href}
                onClick={() => {
                  if (!n.readAt) {
                    markNotificationReadLocal(n.id);
                    void markNotificationReadUnified(n.id).then(() =>
                      refreshNotifications(),
                    );
                  }
                }}
                className={cn(
                  "kumbu-card-interactive flex items-start gap-3 p-4 sm:p-5",
                  !n.readAt && "border-kumbu-primary/20 bg-kumbu-primary-soft/30",
                )}
              >
                <span
                  className={cn(
                    "mt-1 size-2 shrink-0 rounded-full",
                    n.readAt ? "bg-transparent" : "bg-kumbu-primary",
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-snug">{n.title}</p>
                  <p className="mt-1 text-sm text-kumbu-muted">
                    {previewBody(n.body)}
                  </p>
                  <p className="mt-2 text-xs text-kumbu-muted">
                    {n.createdAt
                      ? new Date(n.createdAt).toLocaleString("pt-AO")
                      : ""}
                  </p>
                </div>
                <ChevronRight
                  className="size-5 shrink-0 text-kumbu-muted"
                  aria-hidden
                />
              </Link>
            </li>
            );
          })}
        </ul>
      )}
    </RequireAuth>
  );
}
