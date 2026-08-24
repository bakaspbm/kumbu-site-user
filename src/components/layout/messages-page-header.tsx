"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { NotificationsBellLink } from "@/components/layout/notifications-bell-link";
import { goSmartBack } from "@/lib/navigation/smart-back";

interface MessagesPageHeaderProps {
  title: string;
}

export function MessagesPageHeader({ title }: MessagesPageHeaderProps) {
  const t = useTranslations("chat");
  const router = useRouter();

  return (
    <header className="kumbu-glass sticky top-0 z-30">
      <div className="kumbu-container flex h-14 items-center gap-2.5">
        <button
          type="button"
          className="kumbu-icon-btn"
          aria-label={t("backHome")}
          onClick={() => goSmartBack(router, "/")}
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="line-clamp-1 flex-1 text-base font-bold tracking-tight md:text-lg">
          {title}
        </h1>
        <NotificationsBellLink />
      </div>
    </header>
  );
}
