"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { locales, localeLabels, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOCALE_COOKIE = "NEXT_LOCALE";

type NavLanguageSwitcherProps = {
  className?: string;
  /** Compact codes (PT · EN · FR) for header; full names in sidebar. */
  variant?: "codes" | "labels";
};

export function NavLanguageSwitcher({
  className,
  variant = "codes",
}: NavLanguageSwitcherProps) {
  const t = useTranslations("settings");
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  function setLocale(next: AppLocale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    router.refresh();
  }

  return (
    <div
      className={cn(
        "relative z-10 grid w-full grid-cols-3 gap-1 rounded-xl border border-kumbu-border bg-kumbu-secondary p-1",
        className,
      )}
      role="group"
      aria-label={t("language")}
    >
      {locales.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            title={localeLabels[code]}
            onClick={() => setLocale(code)}
            className={cn(
              "min-w-0 rounded-lg px-1.5 py-2 text-center font-bold transition-all",
              variant === "codes" ? "text-[11px] uppercase tracking-wide" : "text-xs",
              active
                ? "bg-kumbu-surface text-kumbu-primary shadow-sm ring-1 ring-kumbu-border/80"
                : "text-kumbu-foreground/75 hover:bg-kumbu-surface/60 hover:text-kumbu-foreground",
            )}
          >
            {variant === "codes" ? code : localeLabels[code]}
          </button>
        );
      })}
    </div>
  );
}
