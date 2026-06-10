"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/auth-context";
import { isKumbuApiEnabled } from "@/lib/kumbu-api/client";
import { resendVerificationBackend } from "@/lib/kumbu-api/auth";
import { DevEmailActionLink } from "@/components/auth/dev-email-action-link";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";

export function EmailVerificationBanner() {
  const t = useTranslations("auth.emailVerification");
  const tCommon = useTranslations("common");
  const formatErrorMessage = useFormatErrorMessage();
  const { storeUser, isLoggedIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  if (!isLoggedIn || !isKumbuApiEnabled()) return null;
  if (storeUser?.emailVerified !== false) return null;

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
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-semibold">{t("title")}</p>
      <p className="mt-1 text-amber-900/90">{t("body")}</p>
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
        {busy ? tCommon("sending") : t("resend")}
      </button>
    </div>
  );
}
