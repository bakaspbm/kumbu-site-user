import { getCanonicalSiteOrigin } from "@/lib/urls/canonical-site-origin";

function collectAllowedHosts(): Set<string> {
  const hosts = new Set<string>([
    "kumbu-market.com",
    "www.kumbu-market.com",
    "localhost",
    "127.0.0.1",
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || getCanonicalSiteOrigin();
  try {
    hosts.add(new URL(siteUrl).hostname.toLowerCase());
  } catch {
    /* ignore */
  }

  return hosts;
}

function hostnameFromHeaderUrl(value: string | null): string | null {
  if (!value?.trim()) return null;
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isAllowedRequestHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (collectAllowedHosts().has(host)) return true;
  if (
    process.env.NODE_ENV !== "production" &&
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)
  ) {
    return true;
  }
  return false;
}

/** Bloqueia POST cross-site a rotas que definem cookies de sessão. */
export function assertSameOriginRequest(request: Request): boolean {
  const secFetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (secFetchSite === "same-origin" || secFetchSite === "same-site") {
    return true;
  }

  const originHost = hostnameFromHeaderUrl(request.headers.get("origin"));
  if (originHost) return isAllowedRequestHost(originHost);

  const refererHost = hostnameFromHeaderUrl(request.headers.get("referer"));
  if (refererHost) return isAllowedRequestHost(refererHost);

  return process.env.NODE_ENV !== "production";
}
