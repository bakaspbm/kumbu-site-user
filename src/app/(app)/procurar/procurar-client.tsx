"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { BackHeader } from "@/components/layout/back-header";
import { ListingCard } from "@/components/store/listing-card";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useCatalogBootstrap } from "@/hooks/use-catalog-bootstrap";
import { localizeCategoryName } from "@/lib/catalog/localize-catalog";

export function ProcurarClient() {
  const t = useTranslations("search");
  const tCommon = useTranslations("common");
  const tCatalog = useTranslations("catalog");
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [categoryId, setCategoryId] = useState("");
  const { feed, categories, loading, refresh } = useCatalogBootstrap();

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    return feed.filter((p) => {
      if (categoryId && p.categoryId !== categoryId) return false;
      if (!q) return true;
      const hay = [p.title, p.deliveryText, p.priceLabel, p.seller?.displayName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [feed, query, categoryId]);

  function submitSearch() {
    const q = query.trim();
    router.replace(q ? `/procurar?q=${encodeURIComponent(q)}` : "/procurar", {
      scroll: false,
    });
  }

  if (loading) {
    return (
      <article>
        <BackHeader title={t("title")} />
        <PageSkeleton />
      </article>
    );
  }

  return (
    <article>
      <BackHeader title={t("title")} />
      <div className="kumbu-container space-y-4 py-4">
        <div className="kumbu-search-field">
          <Search className="size-4 text-kumbu-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitSearch()}
            placeholder={t("placeholder")}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <button
            type="button"
            onClick={submitSearch}
            className="rounded-lg bg-kumbu-primary px-3 py-1.5 text-xs font-bold text-white"
          >
            {tCommon("search")}
          </button>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setCategoryId("")}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                !categoryId
                  ? "bg-kumbu-primary text-white"
                  : "bg-kumbu-surface text-kumbu-muted"
              }`}
            >
              {tCommon("all")}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                  categoryId === c.id
                    ? "bg-kumbu-primary text-white"
                    : "bg-kumbu-surface text-kumbu-muted"
                }`}
              >
                {localizeCategoryName(c, tCatalog)}
              </button>
            ))}
          </div>
        )}

        <p className="text-sm text-kumbu-muted">{t("listingCount", { count: results.length })}</p>

        {results.length === 0 ? (
          <EmptyState
            icon={Search}
            title={query.trim() ? t("noResultsTitle") : t("noResultsTitleBrowse")}
            description={
              query.trim()
                ? t("noResultsFor", { query: query.trim() })
                : t("noResults")
            }
            actionLabel={query.trim() ? t("clearSearch") : t("noResultsPublish")}
            actionHref={query.trim() ? "/procurar" : "/publicar"}
            className="py-10"
          />
        ) : (
          <ul className="kumbu-listing-grid">
            {results.map((p) => (
              <li key={p.id}>
                <ListingCard product={p} variant="grid" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
