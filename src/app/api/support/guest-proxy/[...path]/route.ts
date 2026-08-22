import { GUEST_SUPPORT_TOKEN_COOKIE } from "@/lib/support/guest-session-cookies";
import { getServerKumbuApiBaseUrl } from "@/lib/kumbu-api/client";
import { originAwareFetch } from "@/lib/kumbu-api/origin-fetch";
import { isCloudflareBlockBody } from "@/lib/kumbu-api/upstream-response";
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
  const base = getServerKumbuApiBaseUrl();
  if (!base) throw new Error("API URL missing");
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

  const upstream = await originAwareFetch(target, {
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

  if (upstream.status === 204 || upstream.status === 205) {
    responseHeaders.delete("content-length");
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("transfer-encoding");
    return new NextResponse(null, {
      status: upstream.status,
      headers: responseHeaders,
    });
  }

  const bodyText = await upstream.text();
  if (isCloudflareBlockBody(bodyText)) {
    return NextResponse.json(
      {
        code: "UPSTREAM_ERROR",
        message: "Serviço temporariamente indisponível. Tente novamente.",
      },
      { status: 502 },
    );
  }

  return new NextResponse(bodyText, {
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
