import { defineRouting } from "next-intl/routing";

export const locales = ["pt", "en", "fr"] as const;
export type AppLocale = (typeof locales)[number];

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale: "pt",
  localePrefix: "never",
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});

export const localeLabels: Record<AppLocale, string> = {
  pt: "Português",
  en: "English",
  fr: "Français",
};
