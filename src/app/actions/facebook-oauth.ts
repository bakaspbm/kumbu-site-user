"use server";

import { getServerKumbuApiBaseUrl } from "@/lib/kumbu-api/client";
import { originAwareFetch } from "@/lib/kumbu-api/origin-fetch";
import type { AuthResponse } from "@/lib/kumbu-api/auth-types";
import type { KumbuSession } from "@/lib/kumbu-api/auth-types";
import { decodeAccessTokenClaims } from "@/lib/kumbu-api/session-tokens";

const GRAPH_VERSION = "v21.0";

function facebookCredentials(): { appId: string; appSecret: string } {
  const appId =
    process.env.KUMBU_FACEBOOK_APP_ID?.trim() ||
    process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim() ||
    "";
  const appSecret = process.env.KUMBU_FACEBOOK_APP_SECRET?.trim() || "";
  if (!appId || !appSecret) {
    throw new Error(
      "Facebook OAuth não configurado no servidor Next.js (KUMBU_FACEBOOK_APP_ID / KUMBU_FACEBOOK_APP_SECRET).",
    );
  }
  return { appId, appSecret };
}

async function exchangeFacebookCode(code: string, redirectUri: string): Promise<string> {
  const { appId, appSecret } = facebookCredentials();
  const body = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code: code.trim(),
  });

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      cache: "no-store",
    },
  );

  type FbTokenResponse = { access_token?: string; error?: { message?: string } };
  let json: FbTokenResponse | null = null;
  try {
    json = (await response.json()) as FbTokenResponse;
  } catch {
    json = null;
  }

  const accessToken = json?.access_token?.trim() ?? "";
  if (!response.ok || !accessToken) {
    throw new Error(json?.error?.message?.trim() || "Não foi possível validar login Facebook.");
  }

  return accessToken;
}

async function fetchFacebookProfile(accessToken: string): Promise<{
  facebookId: string;
  email: string;
  name: string;
  photoUrl: string | null;
}> {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/me`);
  url.searchParams.set("fields", "id,name,email,picture");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url.toString(), { cache: "no-store" });
  type FbProfileResponse = {
    id?: string;
    name?: string;
    email?: string;
    picture?: { data?: { url?: string } };
    error?: { message?: string };
  };
  let json: FbProfileResponse | null = null;
  try {
    json = (await response.json()) as FbProfileResponse;
  } catch {
    json = null;
  }

  if (!response.ok || !json || json.error) {
    throw new Error(
      json?.error?.message?.trim() || "Não foi possível obter perfil Facebook.",
    );
  }

  const email = json.email?.trim() ?? "";
  const facebookId = json.id?.trim() ?? "";
  if (!email || !facebookId) {
    throw new Error(
      "Email não disponível no Facebook. Autorize o acesso ao email na app Meta.",
    );
  }

  return {
    facebookId,
    email,
    name: json.name?.trim() ?? "",
    photoUrl: json.picture?.data?.url?.trim() || null,
  };
}

function toSession(payload: AuthResponse): KumbuSession {
  if (!payload?.accessToken?.trim() || !payload?.refreshToken?.trim()) {
    throw new Error("Resposta de autenticação incompleta (tokens em falta).");
  }
  const claims = decodeAccessTokenClaims(payload.accessToken);
  const userId = payload.userId != null ? String(payload.userId) : (claims?.userId ?? "");
  if (!userId) {
    throw new Error("Resposta de login inválida (sem utilizador).");
  }
  return {
    user: {
      id: userId,
      email: payload.email ?? claims?.email ?? null,
      displayName: payload.displayName ?? null,
    },
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  };
}

/**
 * Troca o code OAuth no Vercel (alcança graph.facebook.com) e regista sessão no backend
 * via originAwareFetch (contorna Cloudflare).
 */
export async function completeFacebookOAuthFromCode(
  code: string,
  redirectUri: string,
): Promise<KumbuSession> {
  const accessToken = await exchangeFacebookCode(code, redirectUri);
  const profile = await fetchFacebookProfile(accessToken);

  const apiBase = getServerKumbuApiBaseUrl();
  if (!apiBase) {
    throw new Error("API backend não configurada.");
  }

  const response = await originAwareFetch(`${apiBase}/auth/oauth/facebook`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Kumbu-Client": "web",
    },
    body: JSON.stringify({
      accessToken,
      signupSource: "web",
      profile: {
        facebookId: profile.facebookId,
        email: profile.email,
        name: profile.name,
        photoUrl: profile.photoUrl ?? undefined,
      },
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as AuthResponse | null;
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: unknown }).message ?? "")
        : "";
    throw new Error(message.trim() || `Erro HTTP ${response.status}`);
  }
  if (!payload) {
    throw new Error("Resposta vazia do servidor. Tente novamente.");
  }
  return toSession(payload);
}
