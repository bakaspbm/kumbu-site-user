import { assertSameOriginRequest } from "@/lib/security/request-origin";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  decodeAccessTokenClaims,
  isAccessTokenExpiringSoon,
} from "@/lib/kumbu-api/session-tokens";
import { getServerKumbuApiBaseUrl } from "@/lib/kumbu-api/client";
import { originAwareFetch } from "@/lib/kumbu-api/origin-fetch";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function refreshAccessFromCookies(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string; maxAge: number } | null> {
  const apiBase = getServerKumbuApiBaseUrl();
  if (!apiBase) return null;

  const upstream = await originAwareFetch(`${apiBase}/auth/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  if (!upstream.ok) return null;

  const upstreamText = await upstream.text();
  if (!upstreamText.trim()) return null;

  type RefreshPayload = {
    accessToken?: string;
    refreshToken?: string;
    expiresInSeconds?: number;
  };
  let payload: RefreshPayload | null = null;
  try {
    payload = JSON.parse(upstreamText) as RefreshPayload;
  } catch {
    return null;
  }
  if (!payload?.accessToken?.trim() || !payload?.refreshToken?.trim()) return null;

  return {
    accessToken: payload.accessToken.trim(),
    refreshToken: payload.refreshToken.trim(),
    maxAge: Math.max(payload.expiresInSeconds ?? 60 * 60 * 24 * 30, 60),
  };
}

export async function GET(request: Request) {
  if (!assertSameOriginRequest(request)) {
    return NextResponse.json({ error: "Pedido não autorizado" }, { status: 403 });
  }

  const jar = await cookies();
  let accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value?.trim() || "";
  let refreshToken = jar.get(REFRESH_TOKEN_COOKIE)?.value?.trim() || "";

  if (!refreshToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  if (!accessToken || isAccessTokenExpiringSoon(accessToken)) {
    const refreshed = await refreshAccessFromCookies(refreshToken);
    if (refreshed) {
      accessToken = refreshed.accessToken;
      refreshToken = refreshed.refreshToken;
      const secure = process.env.NODE_ENV === "production";
      jar.set(ACCESS_TOKEN_COOKIE, accessToken, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: refreshed.maxAge,
      });
      jar.set(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    } else if (!accessToken) {
      // Sem access token e refresh falhou (rede/Cloudflare) — não apagar cookies
      return NextResponse.json(
        { authenticated: false, error: "refresh_failed" },
        { status: 503 },
      );
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
