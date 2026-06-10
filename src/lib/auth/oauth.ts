import { formatOAuthError, type OAuthProvider } from "@/lib/auth/oauth-providers";
import { oauthLoginBackend } from "@/lib/kumbu-api/auth";

export type { OAuthProvider };
export {
  encodeOAuthState,
  oauthCallbackUrl,
  OAUTH_TERMS_COOKIE,
  setOAuthTermsPending,
  startFacebookOAuth,
} from "@/lib/auth/oauth-providers";

export function formatOAuthErrorMessage(err: unknown): string {
  return formatOAuthError(err);
}

export async function signInWithOAuthProvider(
  _client: unknown,
  provider: OAuthProvider,
  _nextPath: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  void _client;
  void _nextPath;
  return {
    ok: false,
    error:
      provider === "google"
        ? "Use o botão «Continuar com Google» no ecrã de login."
        : "Use o botão «Continuar com Facebook» no ecrã de login.",
  };
}

/** Login directo com token (Google id_token ou Facebook access_token). */
export async function completeOAuthTokenLogin(
  provider: OAuthProvider,
  token: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await oauthLoginBackend(provider, token);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: formatOAuthError(err) };
  }
}
