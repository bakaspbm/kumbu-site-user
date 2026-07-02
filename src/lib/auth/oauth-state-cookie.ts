import { sanitizeInternalPath } from "@/lib/auth/safe-redirect";
import { getCanonicalSiteOrigin } from "@/lib/urls/canonical-site-origin";

export const OAUTH_STATE_COOKIE = "kumbu_oauth_pending";
export const OAUTH_STATE_MAX_AGE = 600;

export type OAuthProvider = "google" | "facebook";

export type OAuthStatePayload = {
  provider: OAuthProvider;
  next: string;
  nonce: string;
  redirectUri: string;
};

export function oauthCallbackUrlForServer(): string {
  return `${getCanonicalSiteOrigin()}/auth/callback`;
}

export function createOAuthState(provider: OAuthProvider, nextPath: string): OAuthStatePayload {
  return {
    provider,
    next: sanitizeInternalPath(nextPath, "/"),
    nonce: crypto.randomUUID(),
    redirectUri: oauthCallbackUrlForServer(),
  };
}

export function encodeStatePayload(payload: OAuthStatePayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

export function decodeStatePayload(raw: string | null | undefined): OAuthStatePayload | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(
      Buffer.from(raw.trim(), "base64").toString("utf8"),
    ) as OAuthStatePayload;
    if (parsed.provider !== "google" && parsed.provider !== "facebook") return null;
    if (!parsed.nonce?.trim()) return null;
    return {
      provider: parsed.provider,
      next: sanitizeInternalPath(parsed.next, "/"),
      nonce: parsed.nonce.trim(),
      redirectUri: parsed.redirectUri?.trim() || oauthCallbackUrlForServer(),
    };
  } catch {
    return null;
  }
}
