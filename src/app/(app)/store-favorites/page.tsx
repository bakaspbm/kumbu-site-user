import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Heart } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductCard } from "@/components/store/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { resolveServerAuth } from "@/lib/server-page-auth";
import { getCatalogProductsByIds, getStoreUser } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const t = await getTranslations("accountPages.favorites");
  const auth = await resolveServerAuth();
  const needsLogin = auth.status !== "logged_in";

  let products: Awaited<ReturnType<typeof getCatalogProductsByIds>> = [];
  if (auth.status === "logged_in") {
    const storeUser = await getStoreUser();
    const ids = storeUser?.favorites ?? [];
    if (ids.length > 0) {
      products = await getCatalogProductsByIds(ids).catch(() => []);
    }
  }

  return (
    <>
      <SiteHeader subtitle={t("title")} showSearch={false} />
      <main className="kumbu-container pb-10">
        {needsLogin ? (
          <EmptyState
            className="mt-4"
            icon={Heart}
            title={t("loginTitle")}
            description={t("loginDescription")}
            actionLabel={t("loginAction")}
            actionHref="/login?next=/store-favorites"
          />
        ) : products.length === 0 ? (
          <EmptyState
            className="mt-4"
            icon={Heart}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
            actionLabel={t("exploreProducts")}
            actionHref="/search"
          />
        ) : (
          <ul className="kumbu-listing-grid mt-4">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
        {!needsLogin && (
          <p className="mt-8 text-center text-sm text-kumbu-muted">
            <Link href="/search" className="font-semibold text-kumbu-primary">
              {t("seeMoreProducts")}
            </Link>
          </p>
        )}
      </main>
    </>
  );
}
