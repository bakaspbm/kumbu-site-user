"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ListingImage } from "@/components/ui/listing-image";
import {
  Eye,
  ImageIcon,
  PackageCheck,
  PackageX,
  Pencil,
  Percent,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { formatViewCount } from "@/lib/listing/display-stats";
import { ListingRatingBadge } from "@/components/store/listing-rating-badge";
import { ListingPriceDisplay } from "@/components/store/listing-price-display";
import { PromoteListingDialog } from "@/components/monetization/promote-listing-dialog";
import { productCoverUrl } from "@/lib/store/product-images";
import { productPlaceholderStyle } from "@/lib/utils";
import { RequireAuth } from "@/components/auth/require-auth";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoadingIndicator } from "@/components/ui/page-loading-indicator";
import { requestCatalogRefresh } from "@/lib/catalog-refresh";
import { isJobListing } from "@/lib/jobs/category";
import { useUserMonetizationVisible } from "@/hooks/use-user-monetization-visible";
import {
  listMyListings,
  markJobAsFilled,
  softDeleteCatalogProduct,
  updateCatalogProduct,
} from "@/lib/site-data";
import {
  getOfflineMyListings,
  isBrowserOnline,
  setOfflineMyListings,
} from "@/lib/offline/store";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/kumbu-api/client";
import { refreshBrowserSessionCookies } from "@/lib/kumbu-api/browser-session";
import { cn } from "@/lib/utils";
import type { CatalogProduct } from "@/types/store";

type ListingTab = "active" | "inactive";

function isListingInactive(p: CatalogProduct): boolean {
  return p.isOutOfStock || (p.jobListingStatus != null && p.jobListingStatus !== "active");
}

interface EditDraft {
  title: string;
  priceLabel: string;
  oldPriceLabel: string;
  discountPercent: string;
  description: string;
}

function emptyDraft(p: CatalogProduct): EditDraft {
  return {
    title: p.title,
    priceLabel: p.priceLabel,
    oldPriceLabel: p.oldPriceLabel ?? "",
    discountPercent: p.discountPercent != null ? String(p.discountPercent) : "",
    description: p.description ?? "",
  };
}

function MyListingsManagerInner() {
  const t = useTranslations("accountPages.listings");
  const tCommon = useTranslations("common");
  const tProduct = useTranslations("product");
  const router = useRouter();
  const { user, refresh: refreshAuth } = useAuth();
  const monetizationVisible = useUserMonetizationVisible();
  const [listings, setListings] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ListingTab>("active");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoteId, setPromoteId] = useState<string | null>(null);
  const [promoteCategoryId, setPromoteCategoryId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const userId = user?.id;
    let hadCache = false;
    if (userId) {
      const cached = await getOfflineMyListings(userId);
      if (cached) {
        setListings(cached);
        hadCache = true;
        setLoading(false);
      }
    }
    if (!isBrowserOnline()) {
      setLoading(false);
      return;
    }
    try {
      const fresh = await listMyListings();
      setListings(fresh);
      setError(null);
      if (userId) await setOfflineMyListings(userId, fresh);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setListings([]);
        setError(t("sessionExpired"));
      } else if (!hadCache) {
        setListings([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeListings = useMemo(
    () => listings.filter((p) => !isListingInactive(p)),
    [listings],
  );
  const inactiveListings = useMemo(
    () => listings.filter((p) => isListingInactive(p)),
    [listings],
  );
  const visibleListings = tab === "active" ? activeListings : inactiveListings;

  function openEdit(p: CatalogProduct) {
    setEditingId(p.id);
    setDraft(emptyDraft(p));
    setError(null);
  }

  function closeEdit() {
    setEditingId(null);
    setDraft(null);
  }

  async function toggleStock(p: CatalogProduct) {
    setBusy(true);
    try {
      await updateCatalogProduct(p.id, { isOutOfStock: !p.isOutOfStock });
      requestCatalogRefresh();
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function closeJob(p: CatalogProduct) {
    if (!user?.id || !confirm(t("closeJobConfirm"))) return;
    setBusy(true);
    try {
      await markJobAsFilled(p.id, user.id);
      requestCatalogRefresh();
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit(id: string) {
    if (!draft) return;
    setBusy(true);
    setError(null);

    const payload = {
      title: draft.title.trim(),
      priceLabel: draft.priceLabel.trim(),
      description: draft.description.trim() || null,
      oldPriceLabel: draft.oldPriceLabel.trim() || null,
      discountPercent:
        draft.discountPercent.trim() && !Number.isNaN(Number(draft.discountPercent))
          ? Number(draft.discountPercent)
          : undefined,
      clearPromotion: !draft.oldPriceLabel.trim() && !draft.discountPercent.trim(),
    };

    async function performSave() {
      await updateCatalogProduct(id, payload);
    }

    try {
      try {
        await performSave();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          const refreshed = await refreshBrowserSessionCookies();
          if (refreshed) {
            await refreshAuth();
            await performSave();
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
      closeEdit();
      requestCatalogRefresh();
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(t("sessionExpired"));
        router.push(`/login?next=${encodeURIComponent("/conta/anuncios")}`);
      } else {
        setError(err instanceof Error ? err.message : t("saveError"));
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm(t("removeConfirm"))) return;
    setBusy(true);
    setError(null);
    try {
      await softDeleteCatalogProduct(id);
      setListings((prev) => prev.filter((p) => p.id !== id));
      if (user?.id) {
        const next = listings.filter((p) => p.id !== id);
        void setOfflineMyListings(user.id, next);
      }
      if (editingId === id) closeEdit();
      requestCatalogRefresh();
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("removeError"));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <PageLoadingIndicator label={t("loading")} />;
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={Tag}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        actionLabel={t("emptyAction")}
        actionHref="/publicar"
      />
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-kumbu-surface-muted p-1">
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
        {user?.id && (
          <Link
            href={`/utilizador/${user.id}`}
            className="text-sm font-semibold text-kumbu-primary hover:underline"
          >
            {t("viewPublicProfile")}
          </Link>
        )}
      </div>

      {error && (
        <p
          className="mb-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-red-100"
          role="alert"
        >
          {error}{" "}
          {error === t("sessionExpired") && (
            <Link href="/login?next=%2Fconta%2Fanuncios" className="font-semibold underline">
              {t("loginAgain")}
            </Link>
          )}
        </p>
      )}

      {visibleListings.length === 0 ? (
        <div className="kumbu-card px-4 py-10 text-center">
          <p className="font-semibold text-kumbu-foreground">
            {tab === "active" ? t("noActive") : t("noInactive")}
          </p>
          <p className="mt-1 text-sm text-kumbu-muted">
            {tab === "active" ? t("noActiveHint") : t("noInactiveHint")}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {visibleListings.map((p) => {
            const inactive = isListingInactive(p);
            const isJob = isJobListing(p);
            const jobClosed = isJob && p.jobListingStatus !== "active";
            const isEditing = editingId === p.id && draft;

            return (
              <li
                key={p.id}
                className={cn(
                  "kumbu-card-elevated overflow-hidden",
                  inactive && !isEditing && "opacity-90",
                )}
              >
                {isEditing ? (
                  <div className="p-4 md:p-5">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-kumbu-foreground">{t("editTitle")}</h3>
                      <button
                        type="button"
                        onClick={closeEdit}
                        className="flex size-9 items-center justify-center rounded-lg border border-kumbu-border"
                        aria-label={tCommon("cancel")}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block md:col-span-2">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-kumbu-muted">
                          {t("fieldTitle")}
                        </span>
                        <input
                          value={draft.title}
                          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                          className="kumbu-input w-full"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-kumbu-muted">
                          {t("fieldPrice")}
                        </span>
                        <input
                          value={draft.priceLabel}
                          onChange={(e) => setDraft({ ...draft, priceLabel: e.target.value })}
                          placeholder="15 000 Kz"
                          className="kumbu-input w-full"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-kumbu-muted">
                          {t("fieldOldPrice")}
                        </span>
                        <input
                          value={draft.oldPriceLabel}
                          onChange={(e) => setDraft({ ...draft, oldPriceLabel: e.target.value })}
                          placeholder="20 000 Kz"
                          className="kumbu-input w-full"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-kumbu-muted">
                          <Percent className="size-3" />
                          {t("fieldDiscount")}
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={draft.discountPercent}
                          onChange={(e) => setDraft({ ...draft, discountPercent: e.target.value })}
                          placeholder="10"
                          className="kumbu-input w-full"
                        />
                      </label>
                      <label className="block md:col-span-2">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-kumbu-muted">
                          {t("fieldDescription")}
                        </span>
                        <textarea
                          value={draft.description}
                          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                          rows={3}
                          className="kumbu-input w-full resize-y"
                        />
                      </label>
                    </div>
                    <p className="mt-3 text-xs text-kumbu-muted">{t("promoHint")}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button type="button" disabled={busy} onClick={() => void saveEdit(p.id)}>
                        {tCommon("save")}
                      </Button>
                      <Button type="button" variant="secondary" onClick={closeEdit}>
                        {tCommon("cancel")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row">
                    <Link
                      href={`/produto/${p.id}`}
                      className="relative block aspect-[16/10] w-full shrink-0 overflow-hidden bg-kumbu-surface-muted sm:aspect-auto sm:h-36 sm:w-40"
                    >
                      {productCoverUrl(p) ? (
                        <ListingImage src={productCoverUrl(p)!} alt="" fill />
                      ) : (
                        <div
                          className="flex size-full items-center justify-center"
                          style={productPlaceholderStyle(p.imageColor)}
                        >
                          <ImageIcon className="size-8 text-white/60" />
                        </div>
                      )}
                      {inactive && (
                        <span className="absolute left-2 top-2 rounded-full bg-kumbu-foreground/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          {jobClosed ? t("jobClosedBadge") : t("inactiveBadge")}
                        </span>
                      )}
                      {p.discountPercent != null && p.discountPercent > 0 && (
                        <span className="absolute right-2 top-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          -{p.discountPercent}%
                        </span>
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={`/produto/${p.id}`}
                            className="line-clamp-2 text-base font-bold text-kumbu-foreground hover:text-kumbu-primary"
                          >
                            {p.title}
                          </Link>
                          <div className="mt-1.5">
                            <ListingPriceDisplay
                              priceLabel={p.priceLabel}
                              oldPriceLabel={p.oldPriceLabel}
                              discountPercent={p.discountPercent}
                              size="sm"
                            />
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <ListingRatingBadge product={p} />
                            {formatViewCount(p.viewCount) && (
                              <span className="inline-flex items-center gap-0.5 text-[11px] text-kumbu-muted">
                                <Eye className="size-3" />
                                {formatViewCount(p.viewCount)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-9 gap-1.5 px-3 text-xs"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="size-3.5" />
                          {t("edit")}
                        </Button>
                        {monetizationVisible && (
                          <Button
                            type="button"
                            variant="secondary"
                            className="h-9 gap-1.5 px-3 text-xs"
                            onClick={() => {
                              setPromoteId(p.id);
                              setPromoteCategoryId(p.categoryId);
                            }}
                          >
                            <Sparkles className="size-3.5" />
                            {t("highlight")}
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-9 gap-1.5 px-3 text-xs text-red-600 ring-red-100 hover:bg-red-50"
                          disabled={busy}
                          onClick={() => void remove(p.id)}
                        >
                          <Trash2 className="size-3.5" />
                          {t("remove")}
                        </Button>
                      </div>

                      <div className="mt-3 border-t border-kumbu-border pt-3">
                        {isJob && !jobClosed ? (
                          <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            className="h-10 gap-2"
                            disabled={busy}
                            onClick={() => void closeJob(p)}
                          >
                            <PackageX className="size-4" />
                            {t("closeJob")}
                          </Button>
                        ) : !isJob ? (
                          <Button
                            type="button"
                            variant={p.isOutOfStock ? "primary" : "secondary"}
                            fullWidth
                            className="h-10 gap-2"
                            disabled={busy}
                            onClick={() => void toggleStock(p)}
                          >
                            {p.isOutOfStock ? (
                              <>
                                <PackageCheck className="size-4" />
                                {t("markAvailable")}
                              </>
                            ) : (
                              <>
                                <PackageX className="size-4" />
                                {t("markOutOfStock")}
                              </>
                            )}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {monetizationVisible && promoteId && (
        <PromoteListingDialog
          listingId={promoteId}
          categoryId={promoteCategoryId}
          open={!!promoteId}
          onClose={() => {
            setPromoteId(null);
            setPromoteCategoryId(null);
          }}
        />
      )}
    </>
  );
}

export function MyListingsManager() {
  return (
    <RequireAuth>
      <MyListingsManagerInner />
    </RequireAuth>
  );
}
