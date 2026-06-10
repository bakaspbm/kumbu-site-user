"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MailCheck, MailWarning } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { isKumbuApiEnabled } from "@/lib/kumbu-api/client";
import { resendVerificationBackend } from "@/lib/kumbu-api/auth";
import { DevEmailActionLink } from "@/components/auth/dev-email-action-link";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";

type Props = {
  initialDevLink?: string | null;
};

export function ProfileEmailVerificationStatus({ initialDevLink = null }: Props) {
  const t = useTranslations("auth.emailVerification");
  const tCommon = useTranslations("common");
  const formatErrorMessage = useFormatErrorMessage();
  const { storeUser, isLoggedIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(initialDevLink);

  if (!isLoggedIn || !isKumbuApiEnabled()) return null;
  if (storeUser?.emailVerified !== false) {
    if (storeUser?.emailVerified) {
      return (
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
          <MailCheck className="size-3.5" aria-hidden />
          {t("verified")}
        </span>
      );
    }
    return null;
  }

  async function resend() {
    setBusy(true);
    setMessage(null);
    try {
      const link = await resendVerificationBackend();
      if (link) {
        setDevLink(link);
        setMessage(t("devSmtp"));
      } else {
        setMessage(t("sent"));
      }
    } catch (err) {
      setMessage(formatErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-950">
      <div className="flex items-start gap-2">
        <MailWarning className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{t("unverifiedTitle")}</p>
          <p className="mt-0.5 text-amber-900/90">{t("unverifiedBody")}</p>
          {message ? <p className="mt-2 text-amber-900">{message}</p> : null}
          {devLink ? (
            <div className="mt-2">
              <DevEmailActionLink link={devLink} />
            </div>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void resend()}
            className="mt-2 font-semibold text-kumbu-primary underline-offset-2 hover:underline disabled:opacity-60"
          >
            {busy ? tCommon("sending") : t("resendConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
