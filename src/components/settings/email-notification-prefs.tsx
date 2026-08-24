"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { getStoreUser, updateStoreUser } from "@/lib/site-data";
import { withBrowserAuthRetry } from "@/lib/kumbu-api/with-browser-auth";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";
import { cn } from "@/lib/utils";

export type EmailPrefs = {
  emailOnChat: boolean;
  emailOnNotification: boolean;
  emailOnNewListings: boolean;
};

type PrefKey = keyof EmailPrefs;

const DEFAULT_PREFS: EmailPrefs = {
  emailOnChat: true,
  emailOnNotification: true,
  emailOnNewListings: true,
};

function prefsFromUser(user: {
  emailOnChat?: boolean;
  emailOnNotification?: boolean;
  emailOnNewListings?: boolean;
} | null): EmailPrefs {
  if (!user) return DEFAULT_PREFS;
  return {
    emailOnChat: user.emailOnChat !== false,
    emailOnNotification: user.emailOnNotification !== false,
    emailOnNewListings: user.emailOnNewListings !== false,
  };
}

export function EmailNotificationPrefs({ initial }: { initial?: EmailPrefs }) {
  const t = useTranslations("settings");
  const formatErrorMessage = useFormatErrorMessage();
  const [prefs, setPrefs] = useState(initial ?? DEFAULT_PREFS);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<PrefKey | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const user = await withBrowserAuthRetry(() => getStoreUser());
        if (!cancelled) setPrefs(prefsFromUser(user));
      } catch {
        /* keep initial / defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(key: PrefKey) {
    const next = !prefs[key];
    const previous = prefs;
    setPrefs({ ...prefs, [key]: next });
    setError(null);
    setSavedKey(null);
    startTransition(async () => {
      try {
        const profile = await withBrowserAuthRetry(() =>
          updateStoreUser({ [key]: next }),
        );
        setPrefs(prefsFromUser(profile));
        setSavedKey(key);
      } catch (err) {
        setPrefs(previous);
        setError(formatErrorMessage(err));
      }
    });
  }

  const rows: { key: PrefKey; label: string; desc: string }[] = [
    { key: "emailOnChat", label: t("emailOnChat"), desc: t("emailOnChatDesc") },
    {
      key: "emailOnNotification",
      label: t("emailOnNotification"),
      desc: t("emailOnNotificationDesc"),
    },
    {
      key: "emailOnNewListings",
      label: t("emailOnNewListings"),
      desc: t("emailOnNewListingsDesc"),
    },
  ];

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-kumbu-border/70 rounded-xl ring-1 ring-kumbu-border/60">
        {rows.map(({ key, label, desc }) => {
          const on = prefs[key];
          return (
            <li key={key} className="flex items-start justify-between gap-4 px-3 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-kumbu-foreground">{label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-kumbu-muted">{desc}</p>
                {savedKey === key ? (
                  <p className="mt-1 text-xs font-medium text-emerald-600">{t("emailPrefsSaved")}</p>
                ) : null}
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={label}
                disabled={pending}
                onClick={() => toggle(key)}
                className={cn(
                  "relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60",
                  on ? "bg-kumbu-primary" : "bg-kumbu-border",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform",
                    on ? "translate-x-5" : "translate-x-0.5",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <p className="text-xs text-kumbu-muted">{t("emailPrefsNote")}</p>
    </div>
  );
}
