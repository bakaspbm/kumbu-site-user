import type { CatalogProduct } from "@/types/store";
import { isJobListing } from "@/lib/jobs/category";
import { isPropertyListing } from "@/lib/property/category";
import { productCoverUrl } from "@/lib/store/product-images";
import { parsePriceLabel } from "@/lib/utils";
import { absoluteAssetUrl, absoluteSiteUrl, siteOrigin } from "@/lib/seo/site-url";
import { buildProductDescription } from "@/lib/seo/metadata";

const SHIPPING_COUNTRY = "AO";
const PRICE_CURRENCY = "AOA";

function resolveListingPriceAmount(product: CatalogProduct): number | null {
  const propertyAmount = product.propertyMeta?.priceAmount;
  if (typeof propertyAmount === "number" && propertyAmount > 0) {
    return propertyAmount;
  }

  const parsed = parsePriceLabel(product.priceLabel);
  return parsed > 0 ? parsed : null;
}

function formatOfferPrice(amount: number): string {
  return amount.toFixed(2);
}

function extractBrand(product: CatalogProduct): string | undefined {
  const meta = product.productMeta;
  if (!meta) return undefined;

  for (const key of ["brand", "marca", "Marca"]) {
    const value = meta[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function buildShippingDetails() {
  return {
    "@type": "OfferShippingDetails" as const,
    shippingRate: {
      "@type": "MonetaryAmount" as const,
      value: "0",
      currency: PRICE_CURRENCY,
    },
    shippingDestination: {
      "@type": "DefinedRegion" as const,
      addressCountry: SHIPPING_COUNTRY,
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime" as const,
      handlingTime: {
        "@type": "QuantitativeValue" as const,
        minValue: 1,
        maxValue: 5,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue" as const,
        minValue: 1,
        maxValue: 14,
        unitCode: "DAY",
      },
    },
  };
}

function buildReturnPolicy() {
  return {
    "@type": "MerchantReturnPolicy" as const,
    applicableCountry: SHIPPING_COUNTRY,
    returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    merchantReturnLink: absoluteSiteUrl("/termos"),
  };
}

function buildMerchantOffer(product: CatalogProduct, url: string, priceAmount: number) {
  return {
    "@type": "Offer" as const,
    price: formatOfferPrice(priceAmount),
    priceCurrency: PRICE_CURRENCY,
    availability: product.isOutOfStock
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock",
    url,
    priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    shippingDetails: buildShippingDetails(),
    hasMerchantReturnPolicy: buildReturnPolicy(),
    seller: product.seller
      ? { "@type": "Person" as const, name: product.seller.displayName }
      : undefined,
  };
}

function buildProductIdentifiers(product: CatalogProduct) {
  const brand = extractBrand(product);
  if (brand) {
    return { sku: product.id, brand };
  }
  return { sku: product.id, identifier_exists: false as const };
}

export function buildOrganizationJsonLd() {
  const origin = siteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kumbú",
    url: origin,
    logo: absoluteSiteUrl("/og-image.png"),
    description: "Marketplace angolano para comprar, vender imóveis, produtos e candidatar-se a vagas.",
    areaServed: { "@type": "Country", name: "Angola" },
  };
}

export function buildWebsiteJsonLd() {
  const origin = siteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kumbú",
    url: origin,
    potentialAction: {
      "@type": "SearchAction",
      target: `${origin}/procurar?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildListingJsonLd(product: CatalogProduct): Record<string, unknown> | null {
  const url = absoluteSiteUrl(`/produto/${product.id}`);
  const image = absoluteAssetUrl(productCoverUrl(product));
  const description = buildProductDescription(product);

  if (isJobListing(product)) {
    const location = product.deliveryText?.trim() || product.seller?.city;
    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: product.title,
      description: product.description ?? description,
      url,
      ...(image ? { image } : {}),
      ...(location
        ? {
            jobLocation: {
              "@type": "Place",
              address: { "@type": "PostalAddress", addressLocality: location, addressCountry: "AO" },
            },
          }
        : {}),
      hiringOrganization: {
        "@type": "Organization",
        name: product.seller?.displayName ?? "Kumbú",
      },
    };
  }

  const priceAmount = resolveListingPriceAmount(product);
  if (priceAmount == null) {
    return null;
  }

  const offer = buildMerchantOffer(product, url, priceAmount);
  const identifiers = buildProductIdentifiers(product);

  if (isPropertyListing(product)) {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      description: product.description ?? description,
      url,
      ...(image ? { image } : {}),
      category: "Imóvel",
      ...identifiers,
      offers: offer,
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? description,
    url,
    ...(image ? { image } : {}),
    ...identifiers,
    offers: offer,
  };
}
