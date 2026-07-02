import {
  createOAuthState,
  encodeStatePayload,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_MAX_AGE,
  type OAuthProvider,
} from "@/lib/auth/oauth-state-cookie";
import { assertSameOriginRequest } from "@/lib/security/request-origin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function oauthStateCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: OAUTH_STATE_MAX_AGE,
  };
}

export async function POST(request: Request) {
  if (!assertSameOriginRequest(request)) {
    return NextResponse.json({ error: "Pedido não autorizado" }, { status: 403 });
  }

  const body = (await request.json()) as { provider?: string; next?: string };
  const provider = body.provider as OAuthProvider | undefined;
  if (provider !== "google" && provider !== "facebook") {
    return NextResponse.json({ error: "Provider inválido" }, { status: 400 });
  }

  const payload = createOAuthState(provider, body.next ?? "/");
  const jar = await cookies();
  jar.set(OAUTH_STATE_COOKIE, payload.nonce, oauthStateCookieOptions());

  return NextResponse.json({ state: encodeStatePayload(payload) });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(OAUTH_STATE_COOKIE);
  return NextResponse.json({ ok: true });
}
