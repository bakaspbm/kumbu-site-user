"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { KumbuLogo } from "@/components/brand/kumbu-logo";
import { Button } from "@/components/ui/button";
import { completeAuthRedirect } from "@/lib/auth/complete-auth";
import { sanitizeInternalPath } from "@/lib/auth/safe-redirect";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";
import {
  useValidateEmail,
  useValidatePasswordForLogin,
  useValidatePasswordForSignup,
} from "@/lib/i18n/use-auth-validation";
import { checkBackendReachable } from "@/lib/kumbu-api/backend-reachable";
import { loginWithBackend, registerWithBackend } from "@/lib/kumbu-api/auth";
import { promiseWithTimeout } from "@/lib/promise-timeout";
import { ResetPasswordFormWithSearchParams } from "@/components/auth/reset-password-form";
import { DevEmailActionLink } from "@/components/auth/dev-email-action-link";
import { TermsConsentCheckbox } from "@/components/legal/terms-consent-checkbox";
import { recordTermsConsentAction } from "@/app/actions/compliance";
import { OAuthLoginButtons } from "@/components/auth/oauth-login-buttons";
import { useOAuthConfig } from "@/components/auth/oauth-config-provider";
import { AuthEmailField, AuthPasswordField } from "@/components/auth/auth-form-fields";

function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-kumbu-border" />
      </div>
      <p className="relative mx-auto w-fit bg-kumbu-surface px-3 text-xs font-medium text-kumbu-muted">
        {label}
      </p>
    </div>
  );
}

export function LoginForm() {
  const t = useTranslations("auth");
  const tLegal = useTranslations("legal");
  const formatErrorMessage = useFormatErrorMessage();
  const validateEmail = useValidateEmail();
  const validatePasswordForLogin = useValidatePasswordForLogin();
  const validatePasswordForSignup = useValidatePasswordForSignup();
  const searchParams = useSearchParams();
  const nextPath = sanitizeInternalPath(searchParams.get("next"), "/");
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [authView, setAuthView] = useState<"login" | "signup" | "forgot">(
    initialMode === "signup" ? "signup" : "login",
  );
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [devEmailLink, setDevEmailLink] = useState<string | null>(null);
  const [backendReady, setBackendReady] = useState<boolean | null>(null);
  const { config: oauthConfig, loading: oauthConfigLoading } = useOAuthConfig();
  const socialConfigured =
    !oauthConfigLoading &&
    Boolean(
      (oauthConfig?.googleEnabled && oauthConfig.googleClientId) ||
        (oauthConfig?.facebookEnabled && oauthConfig.facebookAppId),
    );

  useEffect(() => {
    let cancelled = false;
    void checkBackendReachable().then((ready) => {
      if (!cancelled) setBackendReady(ready);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const authError = searchParams.get("auth_error");
    if (authError) setError(authError);
    const authMessage = searchParams.get("auth_message");
    if (authMessage === "password_updated") {
      setMessage(t("passwordUpdated"));
      setAuthView("login");
    }
  }, [searchParams, t]);

  function finishAuthRedirect() {
    const target = sanitizeInternalPath(nextPath, "/");
    completeAuthRedirect(target);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setDevEmailLink(null);

    if (authView === "signup" && !termsAccepted) {
      setError(t("loginPage.termsRequired"));
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.message ?? t("invalidEmail"));
      return;
    }

    const passwordValidation =
      authView === "signup"
        ? validatePasswordForSignup(password)
        : validatePasswordForLogin(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }

    setEmailError(null);
    setPasswordError(null);

    setLoading(true);
    try {
      if (authView === "signup") {
        const result = await registerWithBackend({
          email,
          password,
          fullName: email.split("@")[0] || t("loginPage.defaultUserName"),
        });
        await recordTermsConsentAction();
        if (result.emailActionLink) {
          sessionStorage.setItem("kumbu_dev_email_link", result.emailActionLink);
        }
        sessionStorage.setItem(
          "kumbu_signup_flash",
          result.emailActionLink
            ? t("loginPage.signupFlashDev")
            : t("loginPage.signupFlashEmail"),
        );
        const target =
          nextPath.startsWith("/conta") || nextPath === "/"
            ? nextPath === "/"
              ? "/conta/perfil"
              : nextPath
            : "/conta/perfil";
        completeAuthRedirect(target);
      } else {
        await promiseWithTimeout(
          loginWithBackend(email, password),
          25_000,
          t("loginPage.loginTimeout"),
        );
        finishAuthRedirect();
      }
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const panel = "hidden flex-1 flex-col justify-between kumbu-gradient-brand p-10 text-white lg:flex";

  return (
    <article className="kumbu-page-bg flex min-h-screen">
      <section className={panel}>
        <KumbuLogo height={40} href="/" variant="onDark" />
        <header>
          <h1 className="text-3xl font-extrabold leading-tight">Kumbú</h1>
          <p className="mt-3 max-w-sm text-lg text-white/90">{t("loginPage.heroTagline")}</p>
          <ul className="mt-8 space-y-3 text-sm font-medium text-white/85">
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-5" aria-hidden />
              {t("loginPage.heroBenefit1")}
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-5" aria-hidden />
              {t("loginPage.heroBenefit2")}
            </li>
          </ul>
        </header>
        <p className="text-xs text-white/60">{t("loginPage.heroFooter")}</p>
      </section>

      <section className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-12">
        <figure className="mb-6 flex justify-center lg:hidden">
          <KumbuLogo height={44} href="/" variant="badge" />
        </figure>

        <div className="kumbu-card-elevated w-full max-w-[420px] rounded-2xl p-7 sm:p-8">
          <header className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-kumbu-foreground">
              {authView === "forgot"
                ? t("loginPage.forgotTitle")
                : authView === "signup"
                  ? t("loginPage.signupTitle")
                  : t("loginPage.loginTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-kumbu-muted">
              {authView === "forgot"
                ? t("loginPage.forgotSubtitle")
                : authView === "signup"
                  ? t("registerIntro")
                  : t("loginIntro")}
            </p>
          </header>

          {authView === "forgot" ? (
            <div className="mt-7">
              <ResetPasswordFormWithSearchParams
                onBackToLogin={() => {
                  setAuthView("login");
                  setError(null);
                  setMessage(null);
                }}
              />
            </div>
          ) : (
            <div className="mt-7 space-y-6">
              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
                <fieldset className="space-y-4 border-0 p-0">
                  <AuthEmailField
                    value={email}
                    label={t("email")}
                    onChange={(v) => {
                      setEmail(v);
                      if (error) setError(null);
                    }}
                    error={emailError}
                    onErrorChange={setEmailError}
                  />

                  <AuthPasswordField
                    value={password}
                    label={t("password")}
                    onChange={(v) => {
                      setPassword(v);
                      if (error) setError(null);
                      if (passwordError) setPasswordError(null);
                    }}
                    error={passwordError}
                    showStrength={authView === "signup"}
                    autoComplete={authView === "signup" ? "new-password" : "current-password"}
                    labelExtra={
                      authView === "login" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthView("forgot");
                            setError(null);
                            setMessage(null);
                            setEmailError(null);
                            setPasswordError(null);
                          }}
                          className="text-xs font-medium text-kumbu-primary hover:underline"
                        >
                          {t("loginPage.forgotLink")}
                        </button>
                      ) : undefined
                    }
                  />

                  {backendReady === false && (
                    <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-900" role="alert">
                      {t("loginPage.backendOffline")}
                    </p>
                  )}

                  {error && (
                    <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">
                      {error}
                    </p>
                  )}
                  {message && (
                    <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
                      {message}
                    </p>
                  )}
                  {devEmailLink ? <DevEmailActionLink link={devEmailLink} /> : null}

                  {authView === "signup" && (
                    <TermsConsentCheckbox
                      checked={termsAccepted}
                      onChange={setTermsAccepted}
                      id="terms-email"
                    />
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    disabled={loading || (authView === "signup" && !termsAccepted)}
                    className="h-11 text-[15px]"
                  >
                    {loading ? t("loading") : authView === "signup" ? t("register") : t("login")}
                  </Button>
                </fieldset>
              </form>

              {socialConfigured && <AuthDivider label={t("loginPage.socialDivider")} />}

              {socialConfigured && (
                <OAuthLoginButtons
                  disabled={loading}
                  requireTerms={authView === "signup"}
                  termsAccepted={termsAccepted}
                  nextPath={sanitizeInternalPath(nextPath, "/")}
                  onTermsRequired={() => setError(t("loginPage.termsRequired"))}
                  onSuccess={() => {
                    void recordTermsConsentAction();
                    finishAuthRedirect();
                  }}
                  onError={(msg) => setError(msg)}
                />
              )}

              <div className="space-y-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthView(authView === "signup" ? "login" : "signup");
                    setError(null);
                    setMessage(null);
                    setEmailError(null);
                    setPasswordError(null);
                  }}
                  className="text-sm text-kumbu-muted"
                >
                  {authView === "signup" ? (
                    <>
                      {t("loginPage.hasAccount")}{" "}
                      <span className="font-semibold text-kumbu-primary">{t("login")}</span>
                    </>
                  ) : (
                    <>
                      {t("loginPage.noAccount")}{" "}
                      <span className="font-semibold text-kumbu-primary">{t("register")}</span>
                    </>
                  )}
                </button>

                <Link
                  href="/"
                  className="block text-sm text-kumbu-muted transition hover:text-kumbu-foreground"
                >
                  {t("loginPage.continueWithoutAccount")}
                </Link>

                <p className="text-xs text-kumbu-muted">
                  <Link href="/termos" className="hover:text-kumbu-foreground">
                    {tLegal("terms")}
                  </Link>
                  {" · "}
                  <Link href="/privacidade" className="hover:text-kumbu-foreground">
                    {tLegal("privacy")}
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </article>
  );
}
