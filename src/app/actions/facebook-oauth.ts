"use server";

import { oauthLoginBackend } from "@/lib/kumbu-api/auth";
import type { KumbuSession } from "@/lib/kumbu-api/auth-types";

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

async function exchangeFacebookCode(
  code: string,
  redirectUri: string,
): Promise<string> {
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

  const json = (await response.json()) as {
    access_token?: string;
    error?: { message?: string };
  };

  if (!response.ok || !json.access_token?.trim()) {
    const message =
      json.error?.message?.trim() || "Não foi possível validar login Facebook.";
    throw new Error(message);
  }

  return json.access_token.trim();
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
  const json = (await response.json()) as {
    id?: string;
    name?: string;
    email?: string;
    picture?: { data?: { url?: string } };
    error?: { message?: string };
  };

  if (!response.ok || json.error) {
    throw new Error(
      json.error?.message?.trim() || "Não foi possível obter perfil Facebook.",
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

/** Troca o code OAuth no Vercel (alcança graph.facebook.com) e regista sessão no backend. */
export async function completeFacebookOAuthFromCode(
  code: string,
  redirectUri: string,
): Promise<KumbuSession> {
  const accessToken = await exchangeFacebookCode(code, redirectUri);
  const profile = await fetchFacebookProfile(accessToken);
  return oauthLoginBackend("facebook", accessToken, profile);
}
