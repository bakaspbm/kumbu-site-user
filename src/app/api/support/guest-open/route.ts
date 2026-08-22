import { getServerKumbuApiBaseUrl } from "@/lib/kumbu-api/client";
import { originAwareFetch } from "@/lib/kumbu-api/origin-fetch";
import { assertSameOriginRequest } from "@/lib/security/request-origin";
import { isCloudflareBlockBody } from "@/lib/kumbu-api/upstream-response";
import { NextResponse } from "next/server";

function backendBase(): string {
  const base = getServerKumbuApiBaseUrl();
  if (!base) throw new Error("API URL missing");
  return base.replace(/\/+$/, "");
}

export async function POST(request: Request) {
  if (!assertSameOriginRequest(request)) {
    return NextResponse.json({ error: "Pedido não autorizado" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const upstream = await originAwareFetch(`${backendBase()}/support/guest/session`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Kumbu-Client": "web",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await upstream.text();
  if (isCloudflareBlockBody(text)) {
    return NextResponse.json(
      {
        code: "UPSTREAM_ERROR",
        message: "Serviço temporariamente indisponível. Tente novamente ou escreva para suporte@kumbu-market.com.",
      },
      { status: 502 },
    );
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
    },
  });
}
