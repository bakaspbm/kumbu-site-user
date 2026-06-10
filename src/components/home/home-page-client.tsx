"use client";

import { useEffect } from "react";
import { HomeFeed } from "@/components/home/home-feed";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { demoMarketing } from "@/lib/store/demo-data";
import { useCatalogBootstrap } from "@/hooks/use-catalog-bootstrap";

export function HomePageClient() {
  const { categories, featured, feed, isDemo, loading, refresh } = useCatalogBootstrap();

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <HomeFeed
      categories={categories}
      featured={featured}
      feed={feed}
      marketing={demoMarketing}
      isDemo={isDemo}
    />
  );
}
