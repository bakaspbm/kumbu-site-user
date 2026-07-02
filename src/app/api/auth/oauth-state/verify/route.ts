import {
  decodeStatePayload,
  OAUTH_STATE_COOKIE,
  type OAuthStatePayload,
} from "@/lib/auth/oauth-state-cookie";
import { assertSameOriginRequest } from "@/lib/security/request-origin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!assertSameOriginRequest(request)) {
    return NextResponse.json({ error: "Pedido não autorizado" }, { status: 403 });
  }

  const body = (await request.json()) as { state?: string };
  const payload = decodeStatePayload(body.state);
  if (!payload) {
    return NextResponse.json({ error: "State OAuth inválido" }, { status: 400 });
  }

  const jar = await cookies();
  const pendingNonce = jar.get(OAUTH_STATE_COOKIE)?.value;
  if (!pendingNonce || pendingNonce !== payload.nonce) {
    return NextResponse.json({ error: "Sessão OAuth expirada ou inválida" }, { status: 403 });
  }

  jar.delete(OAUTH_STATE_COOKIE);

  const response: OAuthStatePayload = {
    provider: payload.provider,
    next: payload.next,
    nonce: payload.nonce,
    redirectUri: payload.redirectUri,
  };
  return NextResponse.json(response);
}
