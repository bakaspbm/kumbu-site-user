import type { CatalogProduct } from "@/types/store";
import { isJobListing } from "@/lib/jobs/category";
import { isPropertyListing } from "@/lib/property/category";
import { productCoverUrl } from "@/lib/store/product-images";
import { absoluteAssetUrl, absoluteSiteUrl, siteOrigin } from "@/lib/seo/site-url";
import { buildProductDescription } from "@/lib/seo/metadata";

export function buildOrganizationJsonLd() {
  const origin = siteOrigin();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kumbú",
    url: origin,
    logo: absoluteSiteUrl("/logo_kumbu.svg"),
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

export function buildListingJsonLd(product: CatalogProduct) {
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

  const offer = {
    "@type": "Offer" as const,
    priceCurrency: "AOA",
    availability: product.isOutOfStock
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock",
    url,
    seller: product.seller
      ? { "@type": "Person" as const, name: product.seller.displayName }
      : undefined,
  };

  if (isPropertyListing(product)) {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      description: product.description ?? description,
      url,
      ...(image ? { image } : {}),
      category: "Imóvel",
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
    offers: offer,
  };
}
