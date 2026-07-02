"use client";

import { HomeFeed } from "@/components/home/home-feed";
import { useCatalogBootstrap } from "@/hooks/use-catalog-bootstrap";

export function HomePageClient() {
  const { categories, featured, feed } = useCatalogBootstrap();

  return (
    <HomeFeed
      categories={categories}
      featured={featured}
      feed={feed}
    />
  );
}
