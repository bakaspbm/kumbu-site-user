"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { completeAuthRedirect, resolvePostAuthRedirect } from "@/lib/auth/complete-auth";
import {
  clearOAuthCallbackUrl,
  decodeGoogleIdToken,
  parseOAuthCallbackFromWindow,
  verifyOAuthStateParam,
} from "@/lib/auth/oauth-providers";
import { completeFacebookOAuthFromCode } from "@/app/actions/facebook-oauth";
import { fetchOAuthPublicConfig } from "@/lib/kumbu-api/oauth-config";
import { oauthLoginBackend, persistClientSession } from "@/lib/kumbu-api/auth";
import { useFormatOAuthError, useOAuthCallbackError } from "@/lib/i18n/use-oauth-errors";

function AuthCallbackInner() {
  const t = useTranslations("auth");
  const formatOAuthError = useFormatOAuthError();
  const mapCallbackError = useOAuthCallbackError();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clearOAuthCallbackUrl();

    const parsed = parseOAuthCallbackFromWindow();
    if (!parsed.ok) {
      setError(formatOAuthError(mapCallbackError(parsed.error)));
      return;
    }

    void (async () => {
      try {
        const verified = await verifyOAuthStateParam(parsed.stateParam);
        if (!verified) {
          setError(
            formatOAuthError(
              "Sessão de login expirada ou resposta inválida. Tente novamente.",
            ),
          );
          return;
        }

        const oauthConfig = await fetchOAuthPublicConfig();
        let session;
        if (verified.provider === "facebook") {
          session = await completeFacebookOAuthFromCode(parsed.token, verified.redirectUri);
        } else {
          const profile = decodeGoogleIdToken(parsed.token, oauthConfig.googleClientId);
          session = await oauthLoginBackend("google", parsed.token, profile);
        }

        await persistClientSession(session);
        completeAuthRedirect(resolvePostAuthRedirect(verified.next));
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
