import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";
import { buildContentSecurityPolicy } from "./src/lib/security/content-security-policy";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** IPs/hostnames extra para dev no telemóvel (ex.: 192.168.0.173). Ver .env.local.example */
const devAllowedOrigins = (process.env.DEV_ALLOWED_ORIGINS ?? "192.168.0.173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function apiImageRemotePatterns(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    { protocol: "http", hostname: "localhost", pathname: "/files/**" },
    { protocol: "http", hostname: "127.0.0.1", pathname: "/files/**" },
    { protocol: "http", hostname: "192.168.*", pathname: "/files/**" },
  ];
  const apiUrl = process.env.NEXT_PUBLIC_KUMBU_API_URL?.trim();
  if (!apiUrl) return patterns;
  try {
    const parsed = new URL(apiUrl);
    const protocol = parsed.protocol.replace(":", "") as "http" | "https";
    patterns.push({
      protocol,
      hostname: parsed.hostname,
      pathname: "/files/**",
    });
  } catch {
    /* ignore invalid URL */
  }
  return patterns;
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: devAllowedOrigins,
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
        {
          key: "Content-Security-Policy",
          value: buildContentSecurityPolicy(),
        },
      ],
    },
    {
      source: "/sw.js",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        { key: "Service-Worker-Allowed", value: "/" },
      ],
    },
  ],
  experimental: {
    optimizePackageImports: ["lucide-react"],
    serverActions: {
      bodySizeLimit: "12mb",
    },
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  images: {
    /* Em dev o optimizador dava timeout (500) em JPGs grandes do Storage. */
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: apiImageRemotePatterns(),
    minimumCacheTTL: 60,
  },
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    const backend = "http://127.0.0.1:8080";
    return [
      { source: "/api/kumbu/:path*", destination: `${backend}/api/v1/:path*` },
      { source: "/backend-files/:path*", destination: `${backend}/files/:path*` },
      { source: "/ws-kumbu/:path*", destination: `${backend}/ws/:path*` },
      { source: "/backend-health", destination: `${backend}/actuator/health` },
    ];
  },
  async redirects() {
    return [
      { source: "/search", destination: "/procurar", permanent: true },
      { source: "/user/:id", destination: "/utilizador/:id", permanent: true },
      { source: "/store-favorites", destination: "/conta/favoritos", permanent: true },
      { source: "/loja/favoritos", destination: "/conta/favoritos", permanent: true },
      { source: "/favoritos", destination: "/conta/favoritos", permanent: true },
      { source: "/messages", destination: "/mensagens", permanent: true },
      { source: "/post", destination: "/publicar", permanent: true },
      {
        source: "/forgot-password",
        destination: "/recuperar-palavra-passe",
        permanent: true,
      },
      {
        source: "/recuperar",
        destination: "/recuperar-palavra-passe",
        permanent: true,
      },
      { source: "/product/:id", destination: "/produto/:id", permanent: true },
      { source: "/cart", destination: "/carrinho", permanent: true },
      { source: "/profile", destination: "/conta/perfil", permanent: true },
      { source: "/orders", destination: "/conta/compras", permanent: true },
      { source: "/orders/:id", destination: "/conta/compras/:id", permanent: true },
      { source: "/notifications", destination: "/conta/notificacoes", permanent: true },
      { source: "/delivery-address", destination: "/conta/perfil", permanent: true },
      { source: "/settings", destination: "/conta/definicoes", permanent: true },
      { source: "/loja/definicoes", destination: "/conta/definicoes", permanent: true },
      { source: "/definicoes", destination: "/conta/definicoes", permanent: true },
      { source: "/signup", destination: "/registo", permanent: true },
      { source: "/loja", destination: "/", permanent: true },
      { source: "/loja/pesquisa", destination: "/categorias", permanent: true },
      { source: "/loja/carrinho", destination: "/carrinho", permanent: true },
      { source: "/loja/encomendas", destination: "/conta/compras", permanent: true },
      { source: "/loja/perfil", destination: "/conta/perfil", permanent: true },
      { source: "/loja/checkout", destination: "/checkout", permanent: true },
      { source: "/loja/notificacoes", destination: "/conta/notificacoes", permanent: true },
      { source: "/loja/favoritos", destination: "/categorias", permanent: true },
      { source: "/loja/endereco", destination: "/conta/perfil", permanent: true },
      { source: "/loja/suporte", destination: "/support", permanent: true },
      { source: "/ajuda", destination: "/support", permanent: true },
      { source: "/sobre", destination: "/como-funciona", permanent: true },
      {
        source: "/loja/categoria/:id",
        destination: "/store-category/:id",
        permanent: true,
      },
      {
        source: "/loja/produto/:id",
        destination: "/produto/:id",
        permanent: true,
      },
    ];
  },
};

const hasSentryUpload = Boolean(
  process.env.SENTRY_AUTH_TOKEN &&
    process.env.SENTRY_ORG &&
    process.env.SENTRY_PROJECT,
);

const sentryEnabled = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN?.trim());

export default withSentryConfig(withNextIntl(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !hasSentryUpload,
  widenClientFileUpload: true,
  disableLogger: true,
  sourcemaps: {
    disable: !hasSentryUpload,
  },
  tunnelRoute: sentryEnabled ? "/monitoring" : undefined,
});
