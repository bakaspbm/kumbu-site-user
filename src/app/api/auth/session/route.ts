import { assertSameOriginRequest } from "@/lib/security/request-origin";
import { getServerKumbuApiBaseUrl } from "@/lib/kumbu-api/client";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  TOKEN_MAX_AGE_SECONDS,
} from "@/lib/kumbu-api/session-tokens";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function cookieOptions(maxAge = TOKEN_MAX_AGE_SECONDS) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function POST(request: Request) {
  if (!assertSameOriginRequest(request)) {
    return NextResponse.json({ error: "Pedido não autorizado" }, { status: 403 });
  }

  const body = (await request.json()) as {
    accessToken?: string;
    refreshToken?: string;
    expiresInSeconds?: number;
  };
  if (!body.accessToken?.trim() || !body.refreshToken?.trim()) {
    return NextResponse.json({ error: "Tokens em falta" }, { status: 400 });
  }
  const maxAge = Math.max(body.expiresInSeconds ?? TOKEN_MAX_AGE_SECONDS, 60);
  const jar = await cookies();
  jar.set(ACCESS_TOKEN_COOKIE, body.accessToken.trim(), cookieOptions(maxAge));
  jar.set(REFRESH_TOKEN_COOKIE, body.refreshToken.trim(), cookieOptions(TOKEN_MAX_AGE_SECONDS));
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_TOKEN_COOKIE)?.value;
  const apiBase = getServerKumbuApiBaseUrl();
  if (refreshToken && apiBase) {
    try {
      await fetch(`${apiBase.replace(/\/+$/, "")}/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      /* ignore */
    }
  }
  jar.delete(ACCESS_TOKEN_COOKIE);
  jar.delete(REFRESH_TOKEN_COOKIE);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const jar = await cookies();
  const hasSession = Boolean(jar.get(REFRESH_TOKEN_COOKIE)?.value);
  return NextResponse.json({ authenticated: hasSession });
}
