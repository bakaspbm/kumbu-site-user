"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { completeAuthRedirect } from "@/lib/auth/complete-auth";
import {
  decodeGoogleIdToken,
  fetchFacebookProfileInBrowser,
  parseOAuthCallbackFromWindow,
} from "@/lib/auth/oauth-providers";
import { fetchOAuthPublicConfig } from "@/lib/kumbu-api/oauth-config";
import { oauthLoginBackend } from "@/lib/kumbu-api/auth";
import { useFormatOAuthError, useOAuthCallbackError } from "@/lib/i18n/use-oauth-errors";

function AuthCallbackInner() {
  const t = useTranslations("auth");
  const formatOAuthError = useFormatOAuthError();
  const mapCallbackError = useOAuthCallbackError();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parsed = parseOAuthCallbackFromWindow();

    if (!parsed.ok) {
      setError(formatOAuthError(mapCallbackError(parsed.error)));
      return;
    }

    void (async () => {
      try {
        const oauthConfig = await fetchOAuthPublicConfig();
        if (parsed.provider === "facebook") {
          const profile = await fetchFacebookProfileInBrowser(parsed.token);
          await oauthLoginBackend("facebook", parsed.token, profile);
        } else {
          const profile = decodeGoogleIdToken(parsed.token, oauthConfig.googleClientId);
          await oauthLoginBackend("google", parsed.token, profile);
        }

        if (window.history.replaceState) {
          window.history.replaceState(null, "", "/auth/callback");
        }
        completeAuthRedirect(parsed.next);
      } catch (err) {
        setError(formatOAuthError(err));
      }
    })();
  }, [formatOAuthError, mapCallbackError]);

  if (error) {
    return (
      <div className="kumbu-card max-w-md p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-kumbu-primary">
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return <p className="text-sm text-kumbu-muted">{t("oauth.completingAuth")}</p>;
}

export default function AuthCallbackPage() {
  const t = useTranslations("auth.oauth");

  return (
    <main className="kumbu-page-bg flex min-h-screen items-center justify-center p-6">
      <Suspense fallback={<p className="text-sm text-kumbu-muted">{t("completingAuth")}</p>}>
        <AuthCallbackInner />
      </Suspense>
    </main>
  );
}
