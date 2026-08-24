/** CSP partilhada (compatível com Next.js — evita página em branco). */
export function buildContentSecurityPolicy(_nonce?: string): string {
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
    apiOrigin ? apiOrigin.replace(/^http/, "ws") : "",
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

  // Next.js precisa de 'unsafe-inline' nos scripts (chunks / hidratação).
  // Nonce+strict-dynamic sem integração completa no App Router deixa a UI em branco.
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    isDev ? "'unsafe-eval'" : "",
    "https://accounts.google.com",
    "https://connect.facebook.net",
  ]
    .filter(Boolean)
    .join(" ");

  const mediaSrc = [
    "'self'",
    "blob:",
    apiOrigin,
    // Vídeos de anúncio vêm de api.kumbu-market.com (/files/listing-videos/...)
    "https://api.kumbu-market.com",
    "https://staging.api.kumbu-market.com",
    isDev ? "http://127.0.0.1:8080" : "",
    isDev ? "http://localhost:8080" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    `media-src ${mediaSrc}`,
    "frame-src 'self' https://accounts.google.com https://www.facebook.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ];

  if (!isDev) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}
