import { sanitizeInternalPath } from "@/lib/auth/safe-redirect";
import {
  ensureCanonicalSiteOrigin,
  oauthCallbackUrl,
} from "@/lib/urls/canonical-site-origin";

export type OAuthProvider = "google" | "facebook";

export const OAUTH_TERMS_COOKIE = "kumbu_oauth_terms";

export { oauthCallbackUrl };

export type OAuthStatePayload = {
  provider: OAuthProvider;
  next: string;
  nonce: string;
  redirectUri: string;
};

/** Pede state OAuth ao servidor (nonce guardado em cookie HttpOnly). */
export async function prepareOAuthState(
  provider: OAuthProvider,
  nextPath: string,
): Promise<string> {
  const response = await fetch("/api/auth/oauth-state", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider,
      next: sanitizeInternalPath(nextPath, "/"),
    }),
  });
  if (!response.ok) {
    throw new Error("Não foi possível iniciar login social.");
  }
  const json = (await response.json()) as { state?: string };
  if (!json.state?.trim()) {
    throw new Error("Resposta OAuth inválida.");
  }
  return json.state.trim();
}

/** Valida state OAuth contra cookie HttpOnly no servidor. */
export async function verifyOAuthStateParam(
  stateParam: string | null,
): Promise<OAuthStatePayload | null> {
  if (!stateParam?.trim()) return null;
  const response = await fetch("/api/auth/oauth-state/verify", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state: stateParam.trim() }),
  });
  if (!response.ok) return null;
  return (await response.json()) as OAuthStatePayload;
}

export function setOAuthTermsPending(): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${OAUTH_TERMS_COOKIE}=1; Path=/; Max-Age=600; SameSite=Lax${secure}`;
}

export async function startFacebookOAuth(nextPath: string, appId: string): Promise<void> {
  ensureCanonicalSiteOrigin();

  const facebookAppId = appId.trim();
  if (!facebookAppId) {
    throw new Error("Facebook OAuth não configurado no backend.");
  }

  const redirectUri = oauthCallbackUrl();
  const state = await prepareOAuthState("facebook", nextPath);
  const url = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  url.searchParams.set("client_id", facebookAppId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "email,public_profile");
  url.searchParams.set("response_type", "code");

  window.location.assign(url.toString());
}

export type OAuthCallbackResult =
  | {
      ok: true;
      provider: OAuthProvider;
      token: string;
      next: string;
      redirectUri: string;
      stateParam: string;
    }
  | { ok: false; error: string; next: string };

export type FacebookProfileHint = {
  facebookId: string;
  email: string;
  name: string;
  photoUrl?: string | null;
};

export type GoogleProfileHint = {
  googleSub: string;
  email: string;
  name: string;
  photoUrl?: string | null;
};

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  const padded = pad ? normalized + "=".repeat(4 - pad) : normalized;
  return atob(padded);
}

/** Decodifica o payload do id_token Google no browser (sem chamar a Google). */
export function decodeGoogleIdToken(
  idToken: string,
  expectedClientId?: string | null,
): GoogleProfileHint {
  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("Token Google inválido");
  }

  let payload: {
    sub?: string;
    email?: string;
    name?: string;
    picture?: string;
    aud?: string;
  };
  try {
    payload = JSON.parse(base64UrlDecode(parts[1])) as typeof payload;
  } catch {
    throw new Error("Token Google inválido");
  }

  const expectedAud = expectedClientId?.trim() || null;
  if (expectedAud && payload.aud && payload.aud !== expectedAud) {
    throw new Error("Token Google inválido para esta aplicação");
  }

  const sub = payload.sub?.trim();
  const email = payload.email?.trim();
  if (!sub || !email?.includes("@")) {
    throw new Error("Email não disponível na conta Google.");
  }

  return {
    googleSub: sub,
    email,
    name: payload.name?.trim() ?? "",
    photoUrl: payload.picture ?? null,
  };
}

function readOAuthUrlParams(): {
  hashParams: URLSearchParams;
  queryParams: URLSearchParams;
  stateParam: string | null;
} {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);
  const queryParams = new URLSearchParams(window.location.search);
  const stateParam = hashParams.get("state") ?? queryParams.get("state");
  return { hashParams, queryParams, stateParam };
}

/** Lê parâmetros OAuth da URL (validação do state é feita separadamente no servidor). */
export function parseOAuthCallbackFromWindow(): OAuthCallbackResult {
  if (typeof window === "undefined") {
    return { ok: false, error: "Callback indisponível.", next: "/" };
  }

  const { hashParams, queryParams, stateParam } = readOAuthUrlParams();

  const oauthError = hashParams.get("error") ?? queryParams.get("error");
  if (oauthError) {
    const description =
      hashParams.get("error_description") ??
      queryParams.get("error_description") ??
      hashParams.get("error_reason") ??
      oauthError;
    return { ok: false, error: description, next: "/" };
  }

  if (!stateParam) {
    return {
      ok: false,
      error: "Sessão de login expirada ou resposta inválida. Tente novamente.",
      next: "/",
    };
  }

  const code = queryParams.get("code");
  const idToken = hashParams.get("id_token") ?? queryParams.get("id_token");

  if (code) {
    return {
      ok: true,
      provider: "facebook",
      token: code,
      next: "/",
      redirectUri: oauthCallbackUrl(),
      stateParam,
    };
  }

  if (idToken) {
    return {
      ok: true,
      provider: "google",
      token: idToken,
      next: "/",
      redirectUri: oauthCallbackUrl(),
      stateParam,
    };
  }

  return { ok: false, error: "Resposta de login incompleta. Tente novamente.", next: "/" };
}

export function clearOAuthCallbackUrl(): void {
  if (typeof window === "undefined" || !window.history.replaceState) return;
  window.history.replaceState(null, "", "/auth/callback");
}

/** @deprecated Prefer `useFormatOAuthError` from `@/lib/i18n/use-oauth-errors` in client components. */
export function formatOAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/provider is not enabled|unsupported provider|validation failed/i.test(msg)) {
    return "Este método de entrada ainda não está activo no servidor. Use email ou contacte o suporte.";
  }
  if (/origin_mismatch|origin mismatch/i.test(msg)) {
    return "Domínio não autorizado no Google. Registe https://www.kumbu-market.com nas Origens JavaScript do Google Cloud Console.";
  }
  if (/redirect_uri|redirect uri|URL blocked|can't load URL|url bloqueado/i.test(msg)) {
    return "URL de retorno incorrecta. Registe https://www.kumbu-market.com/auth/callback nas definições OAuth do Facebook e Google.";
  }
  if (/email.*already|already registered/i.test(msg)) {
    return "Este email já tem conta. Entre com email e palavra-passe ou use outro método.";
  }
  if (/facebook.*email|email.*facebook|n[aã]o dispon[ií]vel no facebook/i.test(msg)) {
    return "O Facebook não partilhou o email. Autorize o acesso ao email ou use outro método.";
  }
  if (/google.*inv[aá]lid|token google/i.test(msg)) {
    return "Sessão Google inválida. Tente novamente.";
  }
  if (/google.*rede|oauth2\.googleapis|contactar o google/i.test(msg)) {
    return "O servidor não consegue validar com o Google (rede). Confirme que o backend está activo e facebook-trust-client-profile em dev.";
  }
  if (/n[aã]o configurado|cancelado|bloqueado|popup/i.test(msg)) {
    return msg;
  }
  return msg || "Falha no login social.";
}
