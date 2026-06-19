import { sanitizeInternalPath } from "@/lib/auth/safe-redirect";

export type OAuthProvider = "google" | "facebook";

export const OAUTH_TERMS_COOKIE = "kumbu_oauth_terms";

type OAuthStatePayload = {
  provider: OAuthProvider;
  next: string;
  nonce: string;
};

export function oauthCallbackUrl(): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  return `${origin}/auth/callback`;
}

function randomNonce(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export function encodeOAuthState(provider: OAuthProvider, nextPath: string): string {
  const payload: OAuthStatePayload = {
    provider,
    next: sanitizeInternalPath(nextPath, "/"),
    nonce: randomNonce(),
  };
  return btoa(JSON.stringify(payload));
}

export function decodeOAuthState(raw: string | null): OAuthStatePayload | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(atob(raw)) as OAuthStatePayload;
    if (parsed.provider !== "google" && parsed.provider !== "facebook") return null;
    parsed.next = sanitizeInternalPath(parsed.next, "/");
    return parsed;
  } catch {
    return null;
  }
}

export function setOAuthTermsPending(): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${OAUTH_TERMS_COOKIE}=1; Path=/; Max-Age=600; SameSite=Lax${secure}`;
}

export function startFacebookOAuth(nextPath: string, appId: string): void {
  const facebookAppId = appId.trim();
  if (!facebookAppId) {
    throw new Error("Facebook OAuth não configurado no backend.");
  }

  const redirectUri = oauthCallbackUrl();
  const url = new URL("https://www.facebook.com/v21.0/dialog/oauth");
  url.searchParams.set("client_id", facebookAppId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", encodeOAuthState("facebook", nextPath));
  url.searchParams.set("scope", "email,public_profile");
  url.searchParams.set("response_type", "code");

  window.location.assign(url.toString());
}

export type OAuthCallbackResult =
  | { ok: true; provider: OAuthProvider; token: string; next: string; kind?: "code" | "token" }
  | { ok: false; error: string; next: string };

/** Lê token devolvido no hash (#access_token= / #id_token=) após redirect OAuth. */
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

export async function fetchFacebookProfileInBrowser(accessToken: string): Promise<FacebookProfileHint> {
  const url =
    "https://graph.facebook.com/v21.0/me?" +
    new URLSearchParams({
      fields: "id,name,email,picture.type(large)",
      access_token: accessToken,
    }).toString();

  const res = await fetch(url);
  const json = (await res.json()) as {
    id?: string;
    name?: string;
    email?: string;
    picture?: { data?: { url?: string } };
    error?: { message?: string };
  };

  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? "Não foi possível obter perfil Facebook.");
  }
  if (!json.id || !json.email?.trim()) {
    throw new Error("Email não disponível no Facebook. Autorize o acesso ao email.");
  }

  return {
    facebookId: String(json.id),
    email: json.email.trim(),
    name: json.name?.trim() ?? "",
    photoUrl: json.picture?.data?.url ?? null,
  };
}

export function parseOAuthCallbackFromWindow(): OAuthCallbackResult {
  if (typeof window === "undefined") {
    return { ok: false, error: "Callback indisponível.", next: "/" };
  }

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);
  const queryParams = new URLSearchParams(window.location.search);

  // Facebook (response_type=token) devolve state no hash; Google pode usar query ou hash.
  const stateParam = hashParams.get("state") ?? queryParams.get("state");
  const state = decodeOAuthState(stateParam);
  const next = state?.next ?? "/";

  const oauthError =
    hashParams.get("error") ??
    queryParams.get("error");
  if (oauthError) {
    const description =
      hashParams.get("error_description") ??
      queryParams.get("error_description") ??
      hashParams.get("error_reason") ??
      oauthError;
    return { ok: false, error: description, next };
  }

  if (!state) {
    return {
      ok: false,
      error: "Sessão de login expirada ou resposta inválida. Tente novamente.",
      next,
    };
  }

  if (state.provider === "facebook") {
    const code = queryParams.get("code");
    if (!code) {
      return { ok: false, error: "Código Facebook em falta. Tente novamente.", next };
    }
    return { ok: true, provider: "facebook", token: code, next, kind: "code" };
  }

  const idToken = hashParams.get("id_token") ?? queryParams.get("id_token");
  if (idToken) {
    return { ok: true, provider: "google", token: idToken, next };
  }

  return { ok: false, error: "Resposta de login incompleta. Tente novamente.", next };
}

/** @deprecated Prefer `useFormatOAuthError` from `@/lib/i18n/use-oauth-errors` in client components. */
export function formatOAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/provider is not enabled|unsupported provider|validation failed/i.test(msg)) {
    return "Este método de entrada ainda não está activo no servidor. Use email ou contacte o suporte.";
  }
  if (/redirect_uri|redirect uri|URL blocked|can't load URL/i.test(msg)) {
    return "URL de retorno incorrecta. Confirme http://localhost:3000/auth/callback no Facebook Login.";
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
