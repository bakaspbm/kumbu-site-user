"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductCard } from "@/components/store/product-card";
import { demoCategories } from "@/lib/store/demo-data";
import { searchCatalogProducts } from "@/lib/site-data";
import { useCatalogBootstrap } from "@/hooks/use-catalog-bootstrap";
import type { CatalogCategory, CatalogProduct } from "@/types/store";
import {
  getCategoryExploreHref,
  partitionCategoriesForExplore,
} from "@/lib/catalog/category-links";
import { localizeCategoryKindLabel } from "@/lib/catalog/localize-product-fields";
import { cn } from "@/lib/utils";

type Tab = "categories" | "products";

const SECTION_TITLE_KEYS = {
  products: "sectionProducts",
  stays: "sectionStays",
  jobs: "sectionJobs",
} as const;

export function CategoriesPage() {
  const t = useTranslations("search");
  const tCatalogFields = useTranslations("catalogFields");
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "products" ? "products" : "categories";
  const initialQ = searchParams.get("q") ?? "";

  const [tab, setTab] = useState<Tab>(initialTab);
  const { categories: bootstrapCategories, loading: bootstrapLoading } =
    useCatalogBootstrap();
  const [shownCategories, setShownCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [query, setQuery] = useState(initialQ);
  const [searchingProducts, setSearchingProducts] = useState(false);

  const categories = bootstrapCategories.length > 0 ? bootstrapCategories : demoCategories;
  const loading = bootstrapLoading && categories.length === 0;

  useEffect(() => {
    setShownCategories(categories);
  }, [categories]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (tab !== "categories") return;
    setShownCategories(
      q === "" ? categories : categories.filter((c) => c.name.toLowerCase().includes(q)),
    );
  }, [query, categories, tab]);

  useEffect(() => {
    if (tab !== "products") return;
    const q = query.trim();
    if (!q) {
      setProducts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingProducts(true);
      try {
        const list = await searchCatalogProducts(q);
        setProducts(list);
      } catch {
        setProducts([]);
      } finally {
        setSearchingProducts(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, tab]);

  useEffect(() => {
    if (initialQ) setQuery(initialQ);
    if (initialTab === "products") setTab("products");
  }, [initialQ, initialTab]);

  const placeholder = tab === "categories" ? t("searchCategory") : t("searchProduct");

  const categorySections = useMemo(() => {
    if (tab !== "categories") return [];
    return partitionCategoriesForExplore(shownCategories).map((section) => ({
      ...section,
      title: t(SECTION_TITLE_KEYS[section.key]),
    }));
  }, [shownCategories, tab, t]);

  return (
    <>
      <SiteHeader subtitle={t("explore")} showSearch={false} />
      <main className="kumbu-container pb-10">
        <div className="mt-2 flex gap-2 rounded-2xl border border-kumbu-border bg-kumbu-surface p-1">
          <button
            type="button"
            onClick={() => setTab("categories")}
            className={cn(
              "flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors",
              tab === "categories"
                ? "bg-kumbu-primary text-white shadow-sm"
                : "text-kumbu-muted hover:text-kumbu-foreground",
            )}
          >
            {t("categoriesTab")}
          </button>
          <button
            type="button"
            onClick={() => setTab("products")}
            className={cn(
              "flex-1 rounded-xl py-2.5 text-sm font-bold transition-colors",
              tab === "products"
                ? "bg-kumbu-primary text-white shadow-sm"
                : "text-kumbu-muted hover:text-kumbu-foreground",
            )}
          >
            {t("productsTab")}
          </button>
        </div>

        <label className="relative mt-4 block">
          <span className="sr-only">{placeholder}</span>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-kumbu-muted"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="kumbu-input pl-11"
          />
        </label>

        {tab === "categories" ? (
          loading ? (
            <p className="mt-16 text-center text-sm text-kumbu-muted">{t("loadingCategories")}</p>
          ) : shownCategories.length === 0 ? (
            <p className="mt-16 text-center text-sm text-kumbu-muted">{t("noCategoriesFound")}</p>
          ) : (
            <div className="mt-6 space-y-8">
              {categorySections.map((section) => (
                <section key={section.key}>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-kumbu-muted">
                    {section.title}
                  </h2>
                  <ul className="kumbu-card-grid mt-3">
                    {section.categories.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={getCategoryExploreHref(c)}
                          className="kumbu-card-interactive group flex items-center gap-3 p-4"
                        >
                          <span className="flex size-11 items-center justify-center rounded-xl bg-kumbu-primary/10 text-lg font-extrabold text-kumbu-primary">
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="min-w-0 flex-1">
                            <p className="font-bold text-kumbu-foreground group-hover:text-kumbu-primary">
                              {c.name}
                            </p>
                            <p className="text-xs font-medium text-kumbu-muted">
                              {localizeCategoryKindLabel(c, tCatalogFields)}
                            </p>
                          </span>
                          <ChevronRight className="size-5 shrink-0 text-kumbu-muted transition-transform group-hover:translate-x-0.5 group-hover:text-kumbu-primary" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )
        ) : !query.trim() ? (
          <p className="mt-16 text-center text-sm text-kumbu-muted">{t("typeToSearchProduct")}</p>
        ) : searchingProducts ? (
          <p className="mt-16 text-center text-sm text-kumbu-muted">{t("searchingProducts")}</p>
        ) : products.length === 0 ? (
          <p className="mt-16 text-center text-sm text-kumbu-muted">{t("noProductsFound")}</p>
        ) : (
          <ul className="kumbu-listing-grid mt-6">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
