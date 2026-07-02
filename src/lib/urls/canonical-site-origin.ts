const PRODUCTION_CANONICAL_ORIGIN = "https://www.kumbu-market.com";
const PRODUCTION_APEX_HOST = "kumbu-market.com";
const PRODUCTION_WWW_HOST = "www.kumbu-market.com";

type LocationLike = Pick<Location, "protocol" | "hostname" | "port">;

function isLocalDevHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );
}

/** Origem pública canónica do site (servidor / build). */
export function getCanonicalSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") return PRODUCTION_CANONICAL_ORIGIN;
  return "http://localhost:3000";
}

/** Origem a usar em OAuth — em produção força sempre www.kumbu-market.com. */
export function resolveCanonicalSiteOrigin(location?: LocationLike): string {
  if (!location) return getCanonicalSiteOrigin();

  const host = location.hostname.toLowerCase();
  if (isLocalDevHost(host)) {
    const port = location.port ? `:${location.port}` : "";
    return `${location.protocol}//${host}${port}`;
  }

  if (host === PRODUCTION_APEX_HOST || host === PRODUCTION_WWW_HOST) {
    return PRODUCTION_CANONICAL_ORIGIN;
  }

  const port = location.port ? `:${location.port}` : "";
  return `${location.protocol}//${host}${port}`;
}

export function oauthCallbackUrl(): string {
  const origin =
    typeof window !== "undefined"
      ? resolveCanonicalSiteOrigin(window.location)
      : getCanonicalSiteOrigin();
  return `${origin}/auth/callback`;
}

/** Redireciona apex → www no browser (complementa o middleware). */
export function ensureCanonicalSiteOrigin(): void {
  if (typeof window === "undefined") return;
  if (window.location.hostname.toLowerCase() !== PRODUCTION_APEX_HOST) return;

  const target = new URL(window.location.href);
  target.protocol = "https:";
  target.hostname = PRODUCTION_WWW_HOST;
  window.location.replace(target.toString());
}
