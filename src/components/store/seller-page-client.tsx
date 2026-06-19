"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Star, User } from "lucide-react";
import { BackHeader } from "@/components/layout/back-header";
import { ListingImage } from "@/components/ui/listing-image";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { ListingCard } from "@/components/store/listing-card";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { useOfflineSeller } from "@/hooks/use-offline-seller";
import { ReportContentDialog } from "@/components/legal/report-content-dialog";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { useAuth } from "@/contexts/auth-context";

interface SellerPageClientProps {
  sellerId: string;
}

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "?";
  return (p[0].charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : "")).toUpperCase();
}

export function SellerPageClient({ sellerId }: SellerPageClientProps) {
  const t = useTranslations("store.seller");
  const { user } = useAuth();
  const { seller, listings, loading } = useOfflineSeller(sellerId);

  if (loading) return <PageSkeleton />;

  if (!seller) {
    return (
      <article>
        <BackHeader title={t("title")} />
        <div className="kumbu-container max-w-2xl py-12 text-center">
          <p className="font-bold text-kumbu-foreground">{t("notFound")}</p>
          <p className="mt-2 text-sm text-kumbu-muted">{t("notFoundDesc")}</p>
          <Link href="/procurar" className="mt-6 inline-block text-sm font-semibold text-kumbu-primary">
            {t("backMarketplace")}
          </Link>
        </div>
      </article>
    );
  }

  const reviewCount = seller.sellerReviewCount ?? 0;

  return (
    <article>
      <OfflineBanner />
      <BackHeader title={t("title")} />
      <div className="kumbu-container max-w-2xl py-6">
        <div className="kumbu-card flex items-center gap-4 p-5">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-kumbu-primary text-white">
            {seller.photoUrl ? (
              <ListingImage src={seller.photoUrl} alt="" fill />
            ) : (
              <span className="flex h-full items-center justify-center text-xl font-extrabold">
                {initials(seller.displayName)}
              </span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold">{seller.displayName}</h1>
              {seller.sellerVerified ? <VerifiedBadge /> : null}
            </div>
            {seller.city && (
              <p className="mt-0.5 flex items-center gap-1 text-sm text-kumbu-muted">
                <User className="size-3.5" />
                {seller.city}
              </p>
            )}
            {seller.sellerRating != null && reviewCount > 0 && (
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-amber-600">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {seller.sellerRating.toFixed(1)} · {reviewCount}{" "}
                {reviewCount === 1 ? t("reviewSingular") : t("reviewPlural")}
              </p>
            )}
            <p className="mt-1 text-xs text-kumbu-muted">
              {listings.length === 0
                ? t("noActiveListings")
                : t("activeListings", { count: listings.length })}
            </p>
          </div>
        </div>

        {user && user.id !== sellerId && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
            <ReportContentDialog
              targetType="user"
              targetId={sellerId}
              reportedUserId={sellerId}
              label={t("reportProfile")}
            />
          </div>
        )}

        <h2 className="kumbu-section-title mt-8">{t("listingsTitle")}</h2>
        {listings.length === 0 ? (
          <div className="kumbu-card mt-3 p-6 text-center">
            <p className="text-sm font-medium text-kumbu-foreground">{t("noListingsTitle")}</p>
            <p className="mt-1 text-sm text-kumbu-muted">{t("noListingsDesc")}</p>
          </div>
        ) : (
          <ul className="kumbu-listing-grid mt-3">
            {listings.map((p) => (
              <li key={p.id}>
                <ListingCard product={p} variant="grid" />
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/procurar"
          prefetch
          className="mt-8 block text-center text-sm font-semibold text-kumbu-primary"
        >
          {t("exploreMarketplace")}
        </Link>
      </div>
    </article>
  );
}
