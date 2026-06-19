import { GUEST_SUPPORT_TOKEN_COOKIE } from "@/lib/support/guest-session-cookies";
import { getKumbuApiBaseUrl } from "@/lib/kumbu-api/client";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
  "host",
  "content-length",
  "x-guest-support-token",
]);

function backendBase(): string {
  const base = getKumbuApiBaseUrl();
  if (!base) throw new Error("API URL missing");
  if (base.startsWith("/")) {
    return (
      process.env.NEXT_PUBLIC_KUMBU_API_URL?.replace(/\/+$/, "") ??
      "http://127.0.0.1:8080/api/v1"
    );
  }
  return base.replace(/\/+$/, "");
}

async function proxy(request: NextRequest, path: string) {
  const jar = await cookies();
  const guestToken = jar.get(GUEST_SUPPORT_TOKEN_COOKIE)?.value;
  if (!guestToken) {
    return NextResponse.json({ error: "Sessão de convidado em falta" }, { status: 401 });
  }

  const target = `${backendBase()}/${path}${request.nextUrl.search}`;
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  headers.set("X-Guest-Support-Token", guestToken);

  let body: BodyInit | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.arrayBuffer();
  }

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path.join("/"));
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxy(request, path.join("/"));
}
