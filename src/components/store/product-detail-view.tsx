"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Eye, MapPin, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { BackHeader } from "@/components/layout/back-header";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { PropertyDetailPanel } from "@/components/property/property-detail-panel";
import { ListingContactActions } from "@/components/store/listing-contact-actions";
import { ProductAttributesPanel } from "@/components/catalog/product-attributes-panel";
import { ProductImageGallery } from "@/components/store/product-image-gallery";
import { JobDetailPanel } from "@/components/jobs/job-detail-panel";
import { isJobListing } from "@/lib/jobs/category";
import { isPropertyListing } from "@/lib/property/category";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { ListingRatingBadge } from "@/components/store/listing-rating-badge";
import { ProductReviewsSection } from "@/components/store/product-reviews-section";
import { ProductViewTracker } from "@/components/store/product-view-tracker";
import { ReportContentDialog } from "@/components/legal/report-content-dialog";
import { ListingCard } from "@/components/store/listing-card";
import { PromoteListingDialog } from "@/components/monetization/promote-listing-dialog";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { useUserMonetizationVisible } from "@/hooks/use-user-monetization-visible";
import { formatViewCount } from "@/lib/listing/display-stats";
import { useOfflineProduct } from "@/hooks/use-offline-product";
import { isKumbuApiEnabled } from "@/lib/kumbu-api/client";
import { getSimilarProductsBackend } from "@/lib/kumbu-api/recommendations";
import { notFound } from "next/navigation";
import type { CatalogProduct } from "@/types/store";
import type { KumbuSessionUser } from "@/lib/kumbu-api/auth";

interface ProductDetailViewProps {
  productId: string;
}

function scrollToReviews() {
  document.getElementById("avaliacoes")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

interface ProductDetailLoadedProps {
  product: CatalogProduct;
  productId: string;
  user: KumbuSessionUser | null;
  viewCount: number | null;
  setViewCount: (count: number | null) => void;
  fromCache: boolean;
  isOffline: boolean;
}

function ProductDetailLoaded({
  product,
  productId,
  user,
  viewCount,
  setViewCount,
  fromCache,
  isOffline,
}: ProductDetailLoadedProps) {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const isOwner = user?.id === product.sellerId;
  const monetizationVisible = useUserMonetizationVisible();
  const [similar, setSimilar] = useState<CatalogProduct[]>([]);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const views = viewCount ?? product.viewCount ?? 0;
  const viewsLabel = formatViewCount(views);

  useEffect(() => {
    if (!isKumbuApiEnabled()) return;
    let cancelled = false;
    void getSimilarProductsBackend(productId, 8).then((items) => {
      if (!cancelled) setSimilar(items);
    });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const meta = product.propertyMeta;
  const jobMeta = product.jobMeta;
  const isProperty = isPropertyListing(product) && meta;
  const isJob = isJobListing(product) && jobMeta;
  const sellerRole = isProperty ? "Proprietário" : isJob ? "Empregador" : "Vendedor";
  const sellerName = product.seller?.displayName ?? sellerRole;
  const location =
    product.deliveryText?.trim() || product.seller?.city || "Angola";
  const similarVisible = similar.filter(
    (p) => p.id !== productId && p.sellerId !== user?.id,
  );

  return (
    <article className="min-h-full">
      <ProductViewTracker productId={productId} onViewCount={setViewCount} />
      <OfflineBanner showStale={fromCache && !isOffline} />
      <BackHeader title={tCommon("details")} />

      <section className="kumbu-container py-4 md:py-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start lg:gap-10 xl:gap-14">
          <div className="relative z-0 min-w-0">
            <ProductImageGallery product={product} />
          </div>

          <div className="flex min-w-0 flex-col">
            <p className="inline-block rounded-2xl bg-kumbu-primary-soft px-4 py-2 text-3xl font-extrabold tracking-tight text-kumbu-primary md:text-4xl">
              {product.priceLabel}
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
              {product.title}
            </h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-kumbu-muted">
              <MapPin className="size-4 shrink-0" aria-hidden />
              {location}
            </p>

            {product.sellerId && (
              <Link
                href={`/utilizador/${product.sellerId}`}
                prefetch
                className="kumbu-card-interactive mt-6 flex items-center gap-4 p-4 md:p-5"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-kumbu-primary text-lg font-extrabold text-white">
                  {sellerName.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-kumbu-muted">
                    {sellerRole}
                  </p>
                  <p className="truncate font-bold text-kumbu-foreground">{sellerName}</p>
                  {product.seller?.sellerVerified ? <VerifiedBadge className="mt-1" /> : null}
                  {product.seller?.sellerRating != null &&
                    (product.seller.sellerReviewCount ?? 0) > 0 && (
                      <p className="text-xs font-semibold text-amber-600">
                        {sellerRole} · {product.seller.sellerRating.toFixed(1)} ★ (
                        {product.seller.sellerReviewCount} aval.)
                      </p>
                    )}
                </div>
                <span className="text-sm font-bold text-kumbu-primary">Ver perfil →</span>
              </Link>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <ListingRatingBadge product={product} className="text-sm" />
              {!isJob && (
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="text-sm font-semibold text-kumbu-primary hover:underline"
                >
                  Ver avaliações ↓
                </button>
              )}
              {isOwner && viewsLabel && (
                <p className="inline-flex items-center gap-1 text-sm font-semibold text-kumbu-muted">
                  <Eye className="size-4" aria-hidden />
                  {viewsLabel}
                </p>
              )}
              {isOwner && isKumbuApiEnabled() && monetizationVisible && (
                <button
                  type="button"
                  onClick={() => setPromoteOpen(true)}
                  className="inline-flex items-center gap-1 rounded-full bg-kumbu-primary/10 px-3 py-1 text-sm font-semibold text-kumbu-primary"
                >
                  <Sparkles className="size-4" />
                  {t("highlight")}
                </button>
              )}
            </div>
            {product.isOutOfStock && (
              <span className="mt-3 inline-flex w-fit rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                {t("outOfStock")}
              </span>
            )}
            {isJob && <JobDetailPanel product={product} meta={jobMeta} />}
            {isProperty && <PropertyDetailPanel product={product} meta={meta} />}
            {!isJob && !isProperty && (
              <ProductAttributesPanel meta={product.productMeta} />
            )}
            {product.description && (
              <aside className="mt-6 rounded-2xl border border-black/8 bg-kumbu-surface p-4">
                <h2 className="text-sm font-bold text-kumbu-foreground">{t("description")}</h2>
                <p className="mt-2 text-sm leading-relaxed text-kumbu-muted">
                  {product.description}
                </p>
              </aside>
            )}

            {!isJob && (
              <ProductReviewsSection
                productId={product.id}
                isOwner={isOwner}
                showReviewForm={!!user && !isOwner}
                listingKind={product.listingKind ?? undefined}
                categoryId={product.categoryId}
              />
            )}

            <div className="mt-6">
              <ListingContactActions product={product} />
            </div>
            {!isOwner && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 border-t border-kumbu-border pt-4">
                <ReportContentDialog
                  targetType="product"
                  targetId={productId}
                  reportedUserId={product.sellerId}
                />
              </div>
            )}
            <Link
              href="/categorias"
              prefetch
              className="mt-4 block text-center text-sm font-semibold text-kumbu-muted hover:text-kumbu-primary"
            >
              ← Ver mais anúncios
            </Link>
          </div>
        </div>

        {similarVisible.length > 0 && (
          <section className="mt-10 border-t border-kumbu-border pt-10 md:mt-14 md:pt-14">
            <h2 className="text-lg font-bold text-kumbu-foreground md:text-xl">{t("similar")}</h2>
            <ul className="kumbu-listing-grid kumbu-stagger mt-6">
              {similarVisible.map((p) => (
                <li key={p.id}>
                  <ListingCard product={p} variant="grid" />
                </li>
              ))}
            </ul>
          </section>
        )}
      </section>
      {monetizationVisible && (
        <PromoteListingDialog
          listingId={productId}
          categoryId={product.categoryId}
          open={promoteOpen}
          onClose={() => setPromoteOpen(false)}
        />
      )}
    </article>
  );
}

export function ProductDetailView({ productId }: ProductDetailViewProps) {
  const { product, loading, fromCache, isOffline } = useOfflineProduct(productId);
  const { user } = useAuth();
  const [viewCount, setViewCount] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !product) notFound();
  }, [loading, product]);

  if (loading || !product) {
    return <PageSkeleton variant="detail" />;
  }

  return (
    <ProductDetailLoaded
      product={product}
      productId={productId}
      user={user}
      viewCount={viewCount}
      setViewCount={setViewCount}
      fromCache={fromCache}
      isOffline={isOffline}
    />
  );
}
