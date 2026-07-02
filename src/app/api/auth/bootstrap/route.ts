import { assertSameOriginRequest } from "@/lib/security/request-origin";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  decodeAccessTokenClaims,
  isAccessTokenExpiringSoon,
} from "@/lib/kumbu-api/session-tokens";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!assertSameOriginRequest(request)) {
    return NextResponse.json({ error: "Pedido não autorizado" }, { status: 403 });
  }

  const jar = await cookies();
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value?.trim() || "";
  const refreshToken = jar.get(REFRESH_TOKEN_COOKIE)?.value?.trim() || "";

  if (!refreshToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  if (!accessToken || isAccessTokenExpiringSoon(accessToken)) {
    return NextResponse.json({ authenticated: false, needsRefresh: true }, { status: 401 });
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
