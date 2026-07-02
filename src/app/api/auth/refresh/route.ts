import { getKumbuApiBaseUrl } from "@/lib/kumbu-api/client";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  TOKEN_MAX_AGE_SECONDS,
} from "@/lib/kumbu-api/session-tokens";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "Sem sessão" }, { status: 401 });
  }

  const apiBase = getKumbuApiBaseUrl();
  if (!apiBase) {
    return NextResponse.json({ error: "API não configurada" }, { status: 500 });
  }

  const upstream = await fetch(`${apiBase}/auth/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  if (!upstream.ok) {
    if (upstream.status === 401 || upstream.status === 403) {
      jar.delete(ACCESS_TOKEN_COOKIE);
      jar.delete(REFRESH_TOKEN_COOKIE);
    }
    return NextResponse.json({ error: "Sessão expirada" }, { status: 401 });
  }

  const payload = (await upstream.json()) as {
    accessToken?: string;
    refreshToken?: string;
    expiresInSeconds?: number;
  };

  if (!payload.accessToken || !payload.refreshToken) {
    return NextResponse.json({ error: "Resposta inválida" }, { status: 502 });
  }

  const maxAge = Math.max(payload.expiresInSeconds ?? TOKEN_MAX_AGE_SECONDS, 60);
  const secure = process.env.NODE_ENV === "production";
  jar.set(ACCESS_TOKEN_COOKIE, payload.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  jar.set(REFRESH_TOKEN_COOKIE, payload.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE_SECONDS,
  });

  return NextResponse.json({ ok: true });
}
