"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { NotificationsBellLink } from "@/components/layout/notifications-bell-link";

interface MessagesPageHeaderProps {
  title: string;
}

export function MessagesPageHeader({ title }: MessagesPageHeaderProps) {
  const t = useTranslations("chat");

  return (
    <header className="kumbu-glass sticky top-0 z-30">
      <div className="kumbu-container flex h-14 items-center gap-2.5">
        <Link href="/" className="kumbu-icon-btn" aria-label={t("backHome")}>
          <ChevronLeft className="size-5" />
        </Link>
        <h1 className="line-clamp-1 flex-1 text-base font-bold tracking-tight md:text-lg">
          {title}
        </h1>
        <NotificationsBellLink />
      </div>
    </header>
  );
}
