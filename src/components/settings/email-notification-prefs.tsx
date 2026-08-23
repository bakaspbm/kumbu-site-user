"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateProfileAction } from "@/app/actions/profile";
import { cn } from "@/lib/utils";

export type EmailPrefs = {
  emailOnChat: boolean;
  emailOnNotification: boolean;
  emailOnNewListings: boolean;
};

type PrefKey = keyof EmailPrefs;

export function EmailNotificationPrefs({ initial }: { initial: EmailPrefs }) {
  const t = useTranslations("settings");
  const [prefs, setPrefs] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<PrefKey | null>(null);

  function toggle(key: PrefKey) {
    const next = !prefs[key];
    const previous = prefs;
    setPrefs({ ...prefs, [key]: next });
    setError(null);
    setSavedKey(null);
    startTransition(async () => {
      const result = await updateProfileAction({ [key]: next });
      if (!result.ok) {
        setPrefs(previous);
        setError(result.error);
        return;
      }
      setPrefs({
        emailOnChat: result.profile.emailOnChat ?? next,
        emailOnNotification: result.profile.emailOnNotification ?? next,
        emailOnNewListings: result.profile.emailOnNewListings ?? next,
      });
      setSavedKey(key);
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
