import { assertSameOriginRequest } from "@/lib/security/request-origin";
import { getKumbuApiBaseUrl } from "@/lib/kumbu-api/client";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  TOKEN_MAX_AGE_SECONDS,
  decodeAccessTokenClaims,
  isAccessTokenExpiringSoon,
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

async function refreshTokens(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string; expiresInSeconds?: number } | null> {
  const apiBase = getKumbuApiBaseUrl();
  if (!apiBase || apiBase.startsWith("/")) return null;

  const upstream = await fetch(`${apiBase.replace(/\/+$/, "")}/auth/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  if (!upstream.ok) return null;

  const payload = (await upstream.json()) as {
    accessToken?: string;
    refreshToken?: string;
    expiresInSeconds?: number;
  };
  if (!payload.accessToken?.trim() || !payload.refreshToken?.trim()) return null;
  return {
    accessToken: payload.accessToken.trim(),
    refreshToken: payload.refreshToken.trim(),
    expiresInSeconds: payload.expiresInSeconds,
  };
}

export async function GET(request: Request) {
  if (!assertSameOriginRequest(request)) {
    return NextResponse.json({ error: "Pedido não autorizado" }, { status: 403 });
  }

  const jar = await cookies();
  let accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value?.trim() || "";
  const refreshToken = jar.get(REFRESH_TOKEN_COOKIE)?.value?.trim() || "";

  if (!refreshToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  if (!accessToken || isAccessTokenExpiringSoon(accessToken)) {
    const refreshed = await refreshTokens(refreshToken);
    if (!refreshed) {
      if (!accessToken) {
        jar.delete(ACCESS_TOKEN_COOKIE);
        jar.delete(REFRESH_TOKEN_COOKIE);
        return NextResponse.json({ authenticated: false }, { status: 401 });
      }
    } else {
      accessToken = refreshed.accessToken;
      const maxAge = Math.max(refreshed.expiresInSeconds ?? TOKEN_MAX_AGE_SECONDS, 60);
      jar.set(ACCESS_TOKEN_COOKIE, refreshed.accessToken, cookieOptions(maxAge));
      jar.set(REFRESH_TOKEN_COOKIE, refreshed.refreshToken, cookieOptions());
    }
  }

  const claims = decodeAccessTokenClaims(accessToken);
  if (!claims?.userId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    accessToken,
    userId: claims.userId,
    email: claims.email ?? null,
  });
}
