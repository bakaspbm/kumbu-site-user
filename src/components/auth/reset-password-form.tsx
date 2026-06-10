"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AuthEmailField, AuthPasswordField } from "@/components/auth/auth-form-fields";
import { forgotPasswordBackend, resetPasswordBackend } from "@/lib/kumbu-api/auth";
import { DevEmailActionLink } from "@/components/auth/dev-email-action-link";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";
import {
  validateEmail,
  validatePasswordForSignup,
} from "@/lib/auth/validation";

interface ResetPasswordFormProps {
  onBackToLogin?: () => void;
}

export function ResetPasswordForm({ onBackToLogin }: ResetPasswordFormProps = {}) {
  const t = useTranslations("auth");
  const formatErrorMessage = useFormatErrorMessage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const [step, setStep] = useState<"request" | "update">(
    tokenFromUrl ? "update" : "request",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    if (tokenFromUrl) {
      setStep("update");
      return;
    }

    const authError = searchParams.get("auth_error");
    if (authError) setError(authError);
  }, [searchParams, tokenFromUrl]);

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setDevLink(null);

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.message ?? t("invalidEmail"));
      return;
    }

    setEmailError(null);
    setLoading(true);
    try {
      const generatedDevLink = await forgotPasswordBackend(email.trim());
      if (generatedDevLink) {
        setDevLink(generatedDevLink);
      }
      setMessage(generatedDevLink ? t("resetDevLink") : t("resetEmailSent"));
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const strengthError = validatePasswordForSignup(password);
    if (strengthError) {
      setPasswordError(t("weakPassword"));
      return;
    }
    if (password !== confirm) {
      setConfirmError(t("passwordMismatch"));
      return;
    }

    setPasswordError(null);
    setConfirmError(null);
    setLoading(true);
    try {
      const token = tokenFromUrl?.trim();
      if (!token) {
        setError(t("invalidResetToken"));
        return;
      }
      await resetPasswordBackend(token, password);
      setMessage(t("passwordUpdated"));
      setTimeout(() => {
        router.push("/login?auth_message=password_updated");
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (step === "update") {
    return (
      <form onSubmit={(e) => void handleUpdatePassword(e)} className="flex flex-col gap-4">
        <p className="text-sm text-kumbu-muted">{t("resetUpdateIntro")}</p>
        <AuthPasswordField
          label={t("newPassword")}
          value={password}
          onChange={(v) => {
            setPassword(v);
            setPasswordError(null);
            if (confirm && v !== confirm) {
              setConfirmError(t("passwordMismatch"));
            } else {
              setConfirmError(null);
            }
          }}
          error={passwordError}
          showStrength
          autoComplete="new-password"
        />
        <AuthPasswordField
          label={t("confirmPassword")}
          value={confirm}
          onChange={(v) => {
            setConfirm(v);
            setConfirmError(
              v && password && v !== password ? t("passwordMismatch") : null,
            );
          }}
          error={confirmError}
          autoComplete="new-password"
        />
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>
        )}
        <Button type="submit" fullWidth disabled={loading} className="h-12">
          {loading ? t("saving") : t("saveNewPassword")}
        </Button>
        <Link href="/login" className="text-center text-sm font-semibold text-kumbu-primary">
          {t("backToLogin")}
        </Link>
      </form>
    );
  }

  return (
    <form onSubmit={(e) => void handleSendLink(e)} className="flex flex-col gap-4">
      <p className="text-sm text-kumbu-muted">{t("resetRequestIntro")}</p>
      <AuthEmailField
        value={email}
        onChange={(v) => {
          setEmail(v);
          if (error) setError(null);
        }}
        error={emailError}
        onErrorChange={setEmailError}
        placeholder={t("emailPlaceholder")}
      />
      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>
      )}
      {devLink ? (
        <DevEmailActionLink link={devLink} label={t("resetDevLinkLabel")} />
      ) : null}
      <Button type="submit" fullWidth disabled={loading || !!message} className="h-12">
        {loading ? t("sending") : t("sendRecoveryLink")}
      </Button>
      {onBackToLogin ? (
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-center text-sm font-semibold text-kumbu-primary"
        >
          {t("backToLoginArrow")}
        </button>
      ) : (
        <Link href="/login" className="text-center text-sm font-semibold text-kumbu-primary">
          {t("backToLoginArrow")}
        </Link>
      )}
    </form>
  );
}
