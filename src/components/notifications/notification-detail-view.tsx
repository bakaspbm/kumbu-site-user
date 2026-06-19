"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { BackHeader } from "@/components/layout/back-header";
import { useAuth } from "@/contexts/auth-context";
import { markNotificationRead } from "@/lib/site-data";
import type { UserNotification } from "@/types/store";
import { sanitizeAppLink } from "@/lib/urls/safe-link";
import { cn } from "@/lib/utils";

interface NotificationDetailViewProps {
  notification: UserNotification;
  backHref?: string;
}

export function NotificationDetailView({
  notification,
  backHref = "/conta/notificacoes",
}: NotificationDetailViewProps) {
  const t = useTranslations("notifications");
  const { refreshNotifications, markNotificationReadLocal } = useAuth();

  useEffect(() => {
    if (notification.readAt) return;
    markNotificationReadLocal(notification.id);
    void markNotificationRead(notification.id)
      .then(() => refreshNotifications())
      .catch(() => {});
  }, [notification.id, notification.readAt, refreshNotifications, markNotificationReadLocal]);

  const created = notification.createdAt
    ? new Date(notification.createdAt).toLocaleString("pt-AO", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "—";

  const actionHref = sanitizeAppLink(notification.actionUrl);

  return (
    <>
      <BackHeader title={t("detailTitle")} href={backHref} />
      <main className="kumbu-container max-w-2xl pb-10 pt-6">
        <article
          className={cn(
            "kumbu-card p-6",
            !notification.readAt && "border-kumbu-primary/20",
          )}
        >
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-kumbu-primary-soft">
              <Bell className="size-6 text-kumbu-primary" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-kumbu-muted">{created}</p>
              <h1 className="mt-1 text-xl font-extrabold tracking-tight text-kumbu-foreground">
                {notification.title}
              </h1>
            </div>
          </div>

          <div className="mt-6 border-t border-kumbu-border pt-6">
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-kumbu-foreground">
              {notification.body}
            </p>
          </div>

          {actionHref ? (
            <Link
              href={actionHref}
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-kumbu-primary px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              {t("viewAndRespond")}
            </Link>
          ) : (
            <p className="mt-6 text-xs text-kumbu-muted">
              {t("useMessagesBefore")}{" "}
              <Link href="/mensagens" className="font-semibold text-kumbu-primary hover:underline">
                {t("messagesLink")}
              </Link>
              .
            </p>
          )}
        </article>
      </main>
    </>
  );
}
