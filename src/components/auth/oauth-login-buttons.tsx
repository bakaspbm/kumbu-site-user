"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GoogleLogin } from "@react-oauth/google";
import { useOAuthConfig } from "@/components/auth/oauth-config-provider";
import { oauthLoginBackend } from "@/lib/kumbu-api/auth";
import {
  decodeGoogleIdToken,
  startFacebookOAuth,
} from "@/lib/auth/oauth-providers";
import { ensureCanonicalSiteOrigin } from "@/lib/urls/canonical-site-origin";
import { useFormatOAuthError } from "@/lib/i18n/use-oauth-errors";

type Props = {
  disabled?: boolean;
  requireTerms?: boolean;
  termsAccepted?: boolean;
  nextPath?: string;
  onSuccess: () => void;
  onError: (message: string) => void;
  onTermsRequired?: () => void;
};

function SocialButtonSkeleton() {
  return (
    <div className="h-12 w-full animate-pulse rounded-xl bg-kumbu-secondary" aria-hidden />
  );
}

function GoogleContinuePlaceholder({
  disabled,
  onClick,
  label,
}: {
  disabled?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-kumbu-border bg-white px-4 text-sm font-semibold text-slate-700 shadow-[var(--shadow-kumbu-xs)] transition hover:border-kumbu-primary/15 hover:bg-slate-50/80 disabled:opacity-50"
    >
      <svg className="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {label}
    </button>
  );
}

export function OAuthLoginButtons({
  disabled = false,
  requireTerms = false,
  termsAccepted = true,
  nextPath = "/",
  onSuccess,
  onError,
  onTermsRequired,
}: Props) {
  const t = useTranslations("auth.oauth");
  const formatOAuthError = useFormatOAuthError();
  const { config, loading: configLoading } = useOAuthConfig();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);
  const googleConfigured = Boolean(config?.googleEnabled && config.googleClientId);
  const facebookConfigured = Boolean(config?.facebookEnabled && config.facebookAppId);
  const busy = disabled || googleLoading || fbLoading;
  const termsBlocked = requireTerms && !termsAccepted;

  useEffect(() => {
    ensureCanonicalSiteOrigin();
  }, []);

  function requestTermsAcceptance() {
    onTermsRequired?.();
  }

  async function handleGoogleSuccess(credential?: string) {
    if (!credential) {
      onError(t("googleCancelled"));
      return;
    }
    setGoogleLoading(true);
    try {
      const profile = decodeGoogleIdToken(credential, config?.googleClientId);
      await oauthLoginBackend("google", credential, profile);
      onSuccess();
    } catch (err) {
      onError(formatOAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleFacebook() {
    if (termsBlocked) {
      requestTermsAcceptance();
      return;
    }
    setFbLoading(true);
    void (async () => {
      try {
        if (!config?.facebookAppId) {
          throw new Error(t("facebookNotConfigured"));
        }
        await startFacebookOAuth(nextPath, config.facebookAppId);
      } catch (err) {
        setFbLoading(false);
        onError(formatOAuthError(err));
      }
    })();
  }

  if (configLoading) {
    return (
      <div className="space-y-3">
        <SocialButtonSkeleton />
      </div>
    );
  }

  if (!googleConfigured && !facebookConfigured) {
    return null;
  }

  return (
    <div className="space-y-3">
      {googleConfigured &&
        (termsBlocked ? (
          <GoogleContinuePlaceholder
            disabled={busy}
            label={t("googleContinue")}
            onClick={requestTermsAcceptance}
          />
        ) : (
          <div className="flex min-h-12 w-full items-center justify-center overflow-hidden rounded-xl border border-kumbu-border bg-white shadow-[var(--shadow-kumbu-xs)] [&>div]:w-full [&>div>div]:!w-full">
            <GoogleLogin
              key="google-ready"
              onSuccess={(response) => void handleGoogleSuccess(response.credential)}
              onError={() => onError(t("googleBlocked"))}
              theme="outline"
              size="large"
              width={400}
              text="continue_with"
              shape="rectangular"
            />
          </div>
        ))}

      {facebookConfigured && (
        <button
          type="button"
          disabled={busy}
          onClick={handleFacebook}
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-kumbu-border bg-white px-4 text-sm font-semibold text-slate-700 shadow-[var(--shadow-kumbu-xs)] transition hover:border-kumbu-primary/15 hover:bg-slate-50/80 disabled:opacity-50"
        >
          <svg className="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#1877F2"
              d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
            />
          </svg>
          {fbLoading ? t("facebookRedirecting") : t("facebookContinue")}
        </button>
      )}
    </div>
  );
}
