"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { HomeHeader } from "@/components/home/home-header";
import { HomeCategoryRow } from "@/components/home/home-category-row";
import { TrustStrip } from "@/components/layout/trust-strip";
import { ListingCard } from "@/components/store/listing-card";
import { MarketingHero } from "@/components/store/marketing-hero";
import { SectionHeader } from "@/components/ui/section-header";
import type { AppMarketingBlock, CatalogCategory, CatalogProduct } from "@/types/store";

function matchesQuery(product: CatalogProduct, q: string) {
  const needle = q.toLowerCase().trim();
  if (!needle) return true;
  const hay = [
    product.title,
    product.priceLabel,
    product.deliveryText,
    product.seller?.displayName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

interface HomeFeedProps {
  categories: CatalogCategory[];
  featured: CatalogProduct[];
  feed: CatalogProduct[];
  marketing?: AppMarketingBlock[];
}

export function HomeFeed({
  categories,
  featured,
  feed,
  marketing = [],
}: HomeFeedProps) {
  const t = useTranslations("home");
  const [search, setSearch] = useState("");

  const filteredFeed = useMemo(
    () => feed.filter((p) => matchesQuery(p, search)),
    [feed, search],
  );

  const highlights = useMemo(() => {
    const base = featured.length > 0 ? featured : feed;
    return base.slice(0, 5);
  }, [featured, feed]);

  const nearby = useMemo(() => {
    const highlightIds = new Set(highlights.map((p) => p.id));
    return filteredFeed.filter((p) => !highlightIds.has(p.id));
  }, [filteredFeed, highlights]);

  const heroBlock = marketing[0];

  return (
    <div className="kumbu-page-enter pb-4">
      <HomeHeader searchValue={search} onSearchChange={setSearch} />

      {heroBlock && <MarketingHero block={heroBlock} />}

      <TrustStrip />

      <HomeCategoryRow categories={categories} />

      <div className="kumbu-container space-y-8 py-5 md:space-y-10 md:py-7">
        <section>
          <SectionHeader
            title={t("featured")}
            subtitle={t("featuredSubtitle")}
            href="/procurar"
          />
          {highlights.length === 0 ? (
            <p className="mt-6 text-sm text-kumbu-muted">{t("noFeatured")}</p>
          ) : (
            <ul className="kumbu-listing-grid kumbu-stagger mt-4">
              {highlights.map((p) => (
                <li key={p.id}>
                  <ListingCard product={p} variant="grid" />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionHeader
            title={t("recent")}
            subtitle={
              search.trim()
                ? t("resultsCount", { count: nearby.length })
                : t("recentSubtitle")
            }
          />
          {nearby.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-kumbu-border bg-kumbu-surface/80 px-6 py-14 text-center text-sm text-kumbu-muted">
              {t("noListingsFound")}
            </p>
          ) : (
            <ul className="kumbu-listing-grid kumbu-stagger mt-4">
              {nearby.map((p) => (
                <li key={p.id}>
                  <ListingCard product={p} variant="grid" />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
