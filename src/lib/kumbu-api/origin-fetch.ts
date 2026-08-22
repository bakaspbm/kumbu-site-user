import "server-only";

import http from "node:http";
import https from "node:https";
import type { IncomingMessage } from "node:http";

function isIpv4Host(hostname: string): boolean {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
}

function readIncoming(
  res: IncomingMessage,
): Promise<{ status: number; headers: Headers; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    res.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    res.on("end", () => {
      const headers = new Headers();
      for (const [key, value] of Object.entries(res.headers)) {
        if (value == null) continue;
        if (Array.isArray(value)) headers.set(key, value.join(", "));
        else headers.set(key, value);
      }
      resolve({
        status: res.statusCode ?? 0,
        headers,
        body: Buffer.concat(chunks),
      });
    });
    res.on("error", reject);
  });
}

/**
 * Fetch server→API. Com KUMBU_API_URL=http://IP/api/v1 + KUMBU_API_HOST,
 * contorna Cloudflare Bot Fight (IPs Vercel).
 */
export async function originAwareFetch(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const hostHeader = process.env.KUMBU_API_HOST?.trim();
  const target = new URL(url);

  if (!hostHeader || !isIpv4Host(target.hostname)) {
    return fetch(url, init);
  }

  const isHttps = target.protocol === "https:";
  const lib = isHttps ? https : http;
  const method = (init.method ?? "GET").toUpperCase();
  const headersIn = new Headers(init.headers ?? {});
  const bodyBuf =
    typeof init.body === "string"
      ? Buffer.from(init.body)
      : init.body instanceof ArrayBuffer
        ? Buffer.from(init.body)
        : init.body instanceof Uint8Array
          ? Buffer.from(init.body)
          : undefined;

  const reqHeaders: Record<string, string> = { Host: hostHeader };
  headersIn.forEach((value, key) => {
    if (key.toLowerCase() === "host") return;
    reqHeaders[key] = value;
  });
  if (bodyBuf && !reqHeaders["Content-Length"] && !reqHeaders["content-length"]) {
    reqHeaders["Content-Length"] = String(bodyBuf.byteLength);
  }

  const result = await new Promise<{ status: number; headers: Headers; body: Buffer }>(
    (resolve, reject) => {
      const req = lib.request(
        {
          protocol: target.protocol,
          hostname: target.hostname,
          port: target.port || (isHttps ? 443 : 80),
          path: `${target.pathname}${target.search}`,
          method,
          headers: reqHeaders,
          timeout: 30_000,
        },
        (res) => {
          readIncoming(res).then(resolve, reject);
        },
      );
      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Timeout ao contactar a API de origem."));
      });
      if (bodyBuf) req.write(bodyBuf);
      req.end();
    },
  );

  const status = result.status;
  // 204/205/304 não podem ter body — `new Response(new Uint8Array(...), { status: 204 })` rebenta.
  if (status === 204 || status === 205 || status === 304) {
    const headers = new Headers(result.headers);
    headers.delete("content-length");
    headers.delete("content-encoding");
    headers.delete("transfer-encoding");
    return new Response(null, { status, headers });
  }

  return new Response(new Uint8Array(result.body), {
    status,
    headers: result.headers,
  });
}

/** Só limpar sessão se a API confirmar UNAUTHORIZED (não Cloudflare HTML 403). */
export function isApiUnauthorizedResponse(status: number, bodyText: string): boolean {
  if (status === 401) return true;
  if (status !== 403) return false;
  try {
    const parsed = JSON.parse(bodyText) as { code?: string };
    return parsed.code === "UNAUTHORIZED" || parsed.code === "FORBIDDEN";
  } catch {
    return false;
  }
}
