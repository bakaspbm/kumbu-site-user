import type { Metadata } from "next";
import type { CatalogProduct } from "@/types/store";
import { productCoverUrl } from "@/lib/store/product-images";
import { absoluteAssetUrl, absoluteSiteUrl, DEFAULT_OG_IMAGE, siteOrigin } from "@/lib/seo/site-url";

const SITE_NAME = "Kumbú";

function truncate(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

export function buildProductDescription(product: CatalogProduct): string {
  const location =
    product.deliveryText?.trim() || product.seller?.city || product.seller?.displayName;
  const parts = [product.title, product.priceLabel];
  if (location) parts.push(location);
  if (product.description?.trim()) {
    return truncate(`${parts.join(" · ")} — ${product.description.trim()}`);
  }
  return truncate(`${parts.join(" · ")} — Compre e venda em Angola no Kumbú.`);
}

export function buildRootMetadata(title: string, description: string): Metadata {
  const origin = siteOrigin();
  return {
    metadataBase: new URL(origin),
    title: { default: title, template: `%s | ${SITE_NAME}` },
    description,
    applicationName: SITE_NAME,
    openGraph: {
      type: "website",
      locale: "pt_AO",
      url: origin,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: { canonical: origin },
  };
}

export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
}): Metadata {
  const url = absoluteSiteUrl(opts.path);
  const image = absoluteAssetUrl(opts.image) ?? absoluteSiteUrl(DEFAULT_OG_IMAGE);
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: opts.title,
      description: opts.description,
      images: [{ url: image, alt: opts.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}

export function buildProductMetadata(product: CatalogProduct): Metadata {
  const path = `/produto/${product.id}`;
  const description = buildProductDescription(product);
  const image = absoluteAssetUrl(productCoverUrl(product));
  return buildPageMetadata({
    title: product.title,
    description,
    path,
    image,
  });
}

export function buildCategoryMetadata(categoryName: string, categoryId: string): Metadata {
  const path =
    categoryId === "emprego"
      ? "/emprego"
      : `/store-category/${categoryId}?name=${encodeURIComponent(categoryName)}`;
  return buildPageMetadata({
    title: categoryName,
    description: `Anúncios de ${categoryName} em Angola — explore e contacte vendedores directamente no Kumbú.`,
    path,
  });
}

export function buildSellerMetadata(displayName: string, sellerId: string): Metadata {
  return buildPageMetadata({
    title: displayName,
    description: `Anúncios de ${displayName} no Kumbú — marketplace angolano.`,
    path: `/utilizador/${sellerId}`,
  });
}
