"use client";

import { useTranslations } from "next-intl";
import { NotificationsBellLink } from "@/components/layout/notifications-bell-link";

export function ContaLayoutHeader() {
  const t = useTranslations("account");

  return (
    <header className="mb-6 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-kumbu-foreground md:text-[1.65rem]">
          {t("layoutTitle")}
        </h1>
        <p className="mt-1 text-sm text-kumbu-muted">{t("layoutDescription")}</p>
      </div>
      <NotificationsBellLink className="shrink-0 md:hidden" />
    </header>
  );
}
