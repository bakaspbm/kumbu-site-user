"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getUserBanMessage, isUserCurrentlyBanned } from "@/lib/user-ban";
import type { StoreUser } from "@/types/store";

function banFieldsFromStore(user: StoreUser) {
  return {
    banned_at: user.bannedAt ?? null,
    banned_until: user.bannedUntil ?? null,
    ban_reason: user.banReason ?? null,
  };
}

export function AccountSuspendedBanner() {
  const t = useTranslations("accountSuspension");
  const { storeUser, isLoggedIn } = useAuth();

  if (!isLoggedIn || !storeUser) return null;

  const fields = banFieldsFromStore(storeUser);
  if (!isUserCurrentlyBanned(fields)) return null;

  const detail = getUserBanMessage(fields);

  return (
    <div
      className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-4"
      role="alert"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-3xl items-start gap-3">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-500" aria-hidden />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-bold text-kumbu-foreground">{t("title")}</p>
          {detail ? (
            <p className="text-sm leading-relaxed text-kumbu-muted">{detail}</p>
          ) : (
            <p className="text-sm leading-relaxed text-kumbu-muted">{t("body")}</p>
          )}
          <p className="text-xs leading-relaxed text-kumbu-muted">{t("supportHint")}</p>
          <Link
            href="/support/chat"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-kumbu-primary px-4 text-sm font-bold text-white transition hover:opacity-95"
          >
            {t("contactSupport")}
          </Link>
        </div>
      </div>
    </div>
  );
}
