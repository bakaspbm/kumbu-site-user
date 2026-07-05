import type { MetadataRoute } from "next";
import { absoluteSiteUrl } from "@/lib/seo/site-url";

const DISALLOW = [
  "/api/",
  "/conta/",
  "/checkout",
  "/carrinho",
  "/cart",
  "/mensagens",
  "/login",
  "/registo",
  "/auth/",
  "/onboarding",
  "/orders",
  "/notifications",
  "/settings",
  "/profile",
  "/publicar",
  "/delivery-address",
  "/store-favorites",
  "/confirmar-email",
  "/recuperar-palavra-passe",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOW,
    },
    sitemap: absoluteSiteUrl("/sitemap.xml"),
    host: absoluteSiteUrl("/").replace(/\/$/, ""),
  };
}
