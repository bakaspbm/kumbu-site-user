"use client";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { locales, localeLabels, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOCALE_COOKIE = "NEXT_LOCALE";

export function LanguageSelector() {
  const t = useTranslations("settings");
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  function setLocale(next: AppLocale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    router.refresh();
  }

  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-bold text-kumbu-foreground">
        <Globe className="size-4 text-kumbu-primary" aria-hidden />
        {t("language")}
      </p>
      <p className="mb-3 text-xs text-kumbu-muted">{t("languageDesc")}</p>
      <div
        className="grid grid-cols-3 gap-1 rounded-2xl bg-kumbu-secondary p-1"
        role="group"
        aria-label={t("language")}
      >
        {(locales as readonly AppLocale[]).map((code) => {
          const active = locale === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={cn(
                "rounded-xl px-2 py-3 text-xs font-bold transition-all",
                active
                  ? "bg-kumbu-surface text-kumbu-primary shadow-sm"
                  : "text-kumbu-muted hover:text-kumbu-foreground",
              )}
            >
              {localeLabels[code]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
