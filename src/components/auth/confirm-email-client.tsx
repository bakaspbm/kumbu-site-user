"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { isKumbuApiEnabled } from "@/lib/kumbu-api/client";
import { resendVerificationEmailBackend, verifyEmailBackend } from "@/lib/kumbu-api/auth";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";
import { useAuth } from "@/contexts/auth-context";
import { clearSensitiveTokenFromUrl } from "@/lib/security/clear-url-token";

export function ConfirmEmailClient({ initialToken = "" }: { initialToken?: string }) {
  const t = useTranslations("auth.confirmEmail");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const formatErrorMessage = useFormatErrorMessage();
  const router = useRouter();
  const { refresh } = useAuth();
  const token = initialToken;
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  useEffect(() => {
    if (token.trim()) {
      clearSensitiveTokenFromUrl();
    }
  }, [token]);

  useEffect(() => {
    if (!token.trim()) {
      setStatus("error");
      setMessage(t("invalidLink"));
      return;
    }
    if (!isKumbuApiEnabled()) {
      setStatus("error");
      setMessage(t("apiRequired"));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await verifyEmailBackend(token);
        if (cancelled) return;
        await refresh();
        setStatus("ok");
        setMessage(t("success"));
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setMessage(formatErrorMessage(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, refresh, t, formatErrorMessage]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    const email = resendEmail.trim();
    if (!email) return;
    setResendBusy(true);
    setResendMsg(null);
    try {
      await resendVerificationEmailBackend(email);
      setResendMsg(t("resendSuccess"));
    } catch (err) {
      setResendMsg(formatErrorMessage(err));
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-md">
      <div className="kumbu-card-elevated p-6 text-center">
        {status === "loading" ? (
          <p className="text-sm text-kumbu-muted">{t("confirming")}</p>
        ) : (
          <>
            <p
              className={`text-sm ${status === "ok" ? "text-emerald-800" : "text-red-700"}`}
              role="alert"
            >
              {message}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              {status === "ok" ? (
                <Button onClick={() => router.push("/")} fullWidth>
                  {t("continue")}
                </Button>
              ) : (
                <Button href="/login" fullWidth>
                  {t("goToLogin")}
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      {status === "error" && isKumbuApiEnabled() ? (
        <form onSubmit={(e) => void handleResend(e)} className="mt-6 space-y-3">
          <p className="text-sm text-kumbu-muted">{t("resendIntro")}</p>
          <input
            type="email"
            required
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            className="kumbu-input w-full font-normal"
            placeholder={tAuth("emailPlaceholder")}
          />
          {resendMsg ? <p className="text-sm text-kumbu-muted">{resendMsg}</p> : null}
          <Button type="submit" variant="secondary" fullWidth disabled={resendBusy}>
            {resendBusy ? tCommon("sending") : t("resend")}
          </Button>
        </form>
      ) : null}

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-semibold text-kumbu-primary">
          {tAuth("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
