"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Headphones, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { openGuestSupportSessionBackend } from "@/lib/kumbu-api/support";
import { saveGuestSupportSession, type GuestSupportSession } from "@/lib/support/guest-session";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";

export function GuestSupportIntro({
  onReady,
}: {
  onReady: (session: GuestSupportSession) => void;
}) {
  const t = useTranslations("support");
  const tCommon = useTranslations("common");
  const formatErrorMessage = useFormatErrorMessage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const session = await openGuestSupportSessionBackend(name, email);
      await saveGuestSupportSession(session);
      onReady(session);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-10">
      <div className="kumbu-card space-y-5 p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-kumbu-primary-soft text-kumbu-primary">
            <Headphones className="size-5" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-bold text-kumbu-foreground">{t("guestTitle")}</h2>
            <p className="text-sm text-kumbu-muted">{t("guestSubtitle")}</p>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-kumbu-foreground">{t("guestName")}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="kumbu-input w-full"
              placeholder={t("guestNamePlaceholder")}
              required
              minLength={2}
              disabled={loading}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-kumbu-foreground">{t("guestEmail")}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="kumbu-input w-full"
              placeholder={t("guestEmailPlaceholder")}
              required
              disabled={loading}
            />
          </label>
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          {loading ? (
            <LoadingIndicator
              active={loading}
              label={t("guestStarting")}
              rotatingLabels={[t("guestStartingHint")]}
              slowHint={tCommon("loadingSlowHint")}
              compact
            />
          ) : null}
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? t("guestStarting") : t("guestStart")}
          </Button>
        </form>

        <div className="border-t border-kumbu-border pt-4">
          <p className="text-xs text-kumbu-muted">{t("guestHasAccount")}</p>
          <Link
            href="/login?next=/support/chat"
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-kumbu-primary hover:underline"
          >
            <LogIn className="size-4" aria-hidden />
            {t("guestLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
