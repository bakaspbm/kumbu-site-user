"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { isKumbuApiEnabled } from "@/lib/kumbu-api/client";
import { resendVerificationEmailBackend, verifyEmailBackend } from "@/lib/kumbu-api/auth";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";
import { useAuth } from "@/contexts/auth-context";
import { clearSensitiveTokenFromUrl } from "@/lib/security/clear-url-token";

function normalizeTokenFromUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  try {
    return decodeURIComponent(trimmed).trim();
  } catch {
    return trimmed;
  }
}

export function ConfirmEmailClient({ initialToken = "" }: { initialToken?: string }) {
  const t = useTranslations("auth.confirmEmail");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const formatErrorMessage = useFormatErrorMessage();
  const router = useRouter();
  const { refresh } = useAuth();
  const token = normalizeTokenFromUrl(initialToken);
  const verifyStartedRef = useRef(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    token ? "idle" : "error",
  );
  const [message, setMessage] = useState<string | null>(
    token ? null : t("invalidLink"),
  );
  const [resendEmail, setResendEmail] = useState("");
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const runVerify = useCallback(async () => {
    if (!token || verifyStartedRef.current) return;
    if (!isKumbuApiEnabled()) {
      setStatus("error");
      setMessage(t("apiRequired"));
      return;
    }
    verifyStartedRef.current = true;
    setStatus("loading");
    setMessage(null);
    clearSensitiveTokenFromUrl();
    try {
      await verifyEmailBackend(token);
      await refresh();
      setStatus("ok");
      setMessage(t("success"));
    } catch (err) {
      verifyStartedRef.current = false;
      setStatus("error");
      setMessage(formatErrorMessage(err));
    }
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
        {status === "idle" ? (
          <>
            <p className="text-sm text-kumbu-muted">{t("intro")}</p>
            <Button className="mt-6" onClick={() => void runVerify()} fullWidth>
              {t("confirmButton")}
            </Button>
          </>
        ) : status === "loading" ? (
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
                <>
                  <Button onClick={() => void runVerify()} fullWidth variant="secondary">
                    {t("retry")}
                  </Button>
                  <Button href="/login" fullWidth>
                    {t("goToLogin")}
                  </Button>
                </>
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
