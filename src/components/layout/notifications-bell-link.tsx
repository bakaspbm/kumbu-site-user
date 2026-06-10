"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { NavBadge } from "@/components/ui/nav-badge";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export function NotificationsBellLink({ className }: { className?: string }) {
  const t = useTranslations("notifications");
  const { unreadNotifications } = useAuth();
  const hasUnread = unreadNotifications > 0;

  return (
    <Link
      href="/conta/notificacoes"
      className={cn("kumbu-icon-btn relative", className)}
      aria-label={
        hasUnread
          ? t("bellUnreadAria", { count: unreadNotifications })
          : t("bellAria")
      }
    >
      <Bell
        className={cn("size-[18px]", hasUnread && "text-kumbu-primary")}
        strokeWidth={hasUnread ? 2.25 : 1.75}
      />
      <NavBadge
        count={unreadNotifications}
        className="-right-0.5 -top-0.5"
        pulse={hasUnread}
      />
    </Link>
  );
}
