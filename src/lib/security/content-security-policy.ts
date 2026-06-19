/** CSP partilhada entre rotas Next.js (site e admin). */
export function buildContentSecurityPolicy(): string {
  const isDev = process.env.NODE_ENV === "development";
  const apiUrl = process.env.NEXT_PUBLIC_KUMBU_API_URL?.trim();
  let apiOrigin = "";
  if (apiUrl) {
    try {
      apiOrigin = new URL(apiUrl).origin;
    } catch {
      /* ignore */
    }
  }

  const connectSrc = [
    "'self'",
    apiOrigin,
    "https://*.sentry.io",
    "https://*.ingest.sentry.io",
    "https://accounts.google.com",
    "https://oauth2.googleapis.com",
    "https://www.googleapis.com",
    "https://graph.facebook.com",
    "https://www.facebook.com",
    isDev ? "http://127.0.0.1:8080" : "",
    isDev ? "ws://127.0.0.1:8080" : "",
    isDev ? "ws://localhost:8080" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://accounts.google.com https://connect.facebook.net`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    "frame-src 'self' https://accounts.google.com https://www.facebook.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}
