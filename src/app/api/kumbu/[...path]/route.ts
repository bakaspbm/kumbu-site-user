import { getKumbuApiBaseUrl } from "@/lib/kumbu-api/client";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/kumbu-api/session-tokens";
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
]);

function backendBase(): string {
  const base = getKumbuApiBaseUrl();
  if (!base) throw new Error("API URL missing");
  if (base.startsWith("/")) {
    return process.env.NEXT_PUBLIC_KUMBU_API_URL?.replace(/\/+$/, "")
      ?? "http://127.0.0.1:8080/api/v1";
  }
  return base.replace(/\/+$/, "");
}

async function proxy(request: NextRequest, path: string) {
  const jar = await cookies();
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = jar.get(REFRESH_TOKEN_COOKIE)?.value;

  const target = `${backendBase()}/${path}${request.nextUrl.search}`;
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower) || lower === "accept-encoding") {
      return;
    }
    headers.set(key, value);
  });
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let body: BodyInit | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.arrayBuffer();
  }

  const upstreamInit = (): RequestInit => ({
    method: request.method,
    headers,
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });

  let upstream = await fetch(target, upstreamInit());

  if (upstream.status === 401 && refreshToken) {
    const refreshRes = await fetch(new URL("/api/auth/refresh", request.url), {
      method: "POST",
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });
    if (refreshRes.ok) {
      const newAccess = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
      if (newAccess) {
        headers.set("Authorization", `Bearer ${newAccess}`);
        upstream = await fetch(target, upstreamInit());
      }
    }
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower) || lower === "content-encoding") {
      return;
    }
    responseHeaders.set(key, value);
  });

  const responseBody = await upstream.arrayBuffer();
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxy(request, path.join("/"));
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxy(request, path.join("/"));
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxy(request, path.join("/"));
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxy(request, path.join("/"));
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  return proxy(request, path.join("/"));
}
