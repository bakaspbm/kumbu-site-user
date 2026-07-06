"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";
import type { CatalogProduct } from "@/types/store";

interface SellerPageClientProps {
  sellerId: string;
}

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "?";
  return (p[0].charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : "")).toUpperCase();
}

function isListingInactive(p: CatalogProduct): boolean {
  return p.isOutOfStock || (p.jobListingStatus != null && p.jobListingStatus !== "active");
}

type SellerTab = "active" | "inactive";

export function SellerPageClient({ sellerId }: SellerPageClientProps) {
  const t = useTranslations("store.seller");
  const { user } = useAuth();
  const isOwner = user?.id === sellerId;
  const { seller, listings, loading } = useOfflineSeller(sellerId, { includeInactive: isOwner });
  const [tab, setTab] = useState<SellerTab>("active");

  const activeListings = useMemo(
    () => listings.filter((p) => !isListingInactive(p)),
    [listings],
  );
  const inactiveListings = useMemo(
    () => listings.filter((p) => isListingInactive(p)),
    [listings],
  );
  const visibleListings = isOwner
    ? tab === "active"
      ? activeListings
      : inactiveListings
    : activeListings;

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
              {isOwner
                ? t("ownerListingSummary", {
                    active: activeListings.length,
                    inactive: inactiveListings.length,
                  })
                : activeListings.length === 0
                  ? t("noActiveListings")
                  : t("activeListings", { count: activeListings.length })}
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="mt-4 inline-flex rounded-xl bg-kumbu-surface-muted p-1">
            <button
              type="button"
              onClick={() => setTab("active")}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                tab === "active"
                  ? "bg-white text-kumbu-foreground shadow-sm"
                  : "text-kumbu-muted hover:text-kumbu-foreground",
              )}
            >
              {t("tabActive", { count: activeListings.length })}
            </button>
            <button
              type="button"
              onClick={() => setTab("inactive")}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                tab === "inactive"
                  ? "bg-white text-kumbu-foreground shadow-sm"
                  : "text-kumbu-muted hover:text-kumbu-foreground",
              )}
            >
              {t("tabInactive", { count: inactiveListings.length })}
            </button>
          </div>
        )}

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
        {visibleListings.length === 0 ? (
          <div className="kumbu-card mt-3 p-6 text-center">
            <p className="text-sm font-medium text-kumbu-foreground">
              {isOwner && tab === "inactive" ? t("noInactiveListings") : t("noListingsTitle")}
            </p>
            <p className="mt-1 text-sm text-kumbu-muted">
              {isOwner && tab === "inactive" ? t("noInactiveListingsDesc") : t("noListingsDesc")}
            </p>
          </div>
        ) : (
          <ul className="kumbu-listing-grid mt-3">
            {visibleListings.map((p) => (
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
