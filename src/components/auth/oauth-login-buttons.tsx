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

  useEffect(() => {
    ensureCanonicalSiteOrigin();
  }, []);

  function guardTerms(): boolean {
    if (requireTerms && !termsAccepted) {
      onTermsRequired?.();
      return false;
    }
    return true;
  }

  async function handleGoogleSuccess(credential?: string) {
    if (!guardTerms()) return;
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
    if (!guardTerms()) return;
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
        <SocialButtonSkeleton />
      </div>
    );
  }

  if (!googleConfigured && !facebookConfigured) {
    return null;
  }

  return (
    <div className="space-y-3">
      {googleConfigured && (
        <div className="flex min-h-12 w-full items-center justify-center overflow-hidden rounded-xl border border-kumbu-border bg-white shadow-[var(--shadow-kumbu-xs)] [&>div]:w-full [&>div>div]:!w-full">
          <GoogleLogin
            onSuccess={(response) => void handleGoogleSuccess(response.credential)}
            onError={() => onError(t("googleBlocked"))}
            theme="outline"
            size="large"
            width={400}
            text="continue_with"
            shape="rectangular"
          />
        </div>
      )}

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
