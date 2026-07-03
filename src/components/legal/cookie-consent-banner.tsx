"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { recordCookieConsentAction } from "@/app/actions/compliance";

const STORAGE_KEY = "kumbu_cookie_consent_v1";

export function CookieConsentBanner() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept(choice: "essential" | "all") {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* ignore */
    }
    void recordCookieConsentAction(choice);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-[60] border-t border-kumbu-border bg-kumbu-surface/95 p-4 shadow-lg backdrop-blur-md md:bottom-4 md:left-4 md:right-auto md:z-40 md:max-w-md md:rounded-2xl md:border"
      role="dialog"
      aria-label={t("dialogLabel")}
    >
      <p className="text-sm font-bold text-kumbu-foreground">{t("title")}</p>
      <p className="mt-1 text-xs leading-relaxed text-kumbu-muted">
        {t("description")}{" "}
        <Link href="/cookies" className="font-semibold text-kumbu-primary">
          {t("learnMore")}
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => accept("essential")}
          className="h-10 flex-1 rounded-xl border border-kumbu-border px-3 text-xs font-bold text-kumbu-foreground"
        >
          {t("essentialOnly")}
        </button>
        <button
          type="button"
          onClick={() => accept("all")}
          className="h-10 flex-1 rounded-xl bg-kumbu-primary px-3 text-xs font-bold text-white"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
