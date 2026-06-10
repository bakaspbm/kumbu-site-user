"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ListingImage } from "@/components/ui/listing-image";
import { Eye, ImageIcon, Pencil, Sparkles, Tag, Trash2 } from "lucide-react";
import { formatViewCount } from "@/lib/listing/display-stats";
import { ListingRatingBadge } from "@/components/store/listing-rating-badge";
import { PromoteListingDialog } from "@/components/monetization/promote-listing-dialog";
import { productCoverUrl } from "@/lib/store/product-images";
import { productPlaceholderStyle } from "@/lib/utils";
import { RequireAuth } from "@/components/auth/require-auth";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requestCatalogRefresh } from "@/lib/catalog-refresh";
import {
  listMyListings,
  softDeleteCatalogProduct,
  updateCatalogProduct,
} from "@/lib/site-data";
import {
  getOfflineMyListings,
  isBrowserOnline,
  setOfflineMyListings,
} from "@/lib/offline/store";
import type { CatalogProduct } from "@/types/store";

async function sessionUserId(): Promise<string | undefined> {
  return undefined;
}

function MyListingsManagerInner() {
  const t = useTranslations("accountPages.listings");
  const tCommon = useTranslations("common");
  const tProduct = useTranslations("product");
  const [listings, setListings] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoteId, setPromoteId] = useState<string | null>(null);
  const [promoteCategoryId, setPromoteCategoryId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const userId = await sessionUserId();
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
      if (userId) await setOfflineMyListings(userId, fresh);
    } catch {
      if (!hadCache) setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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

  async function saveEdit(id: string) {
    setBusy(true);
    try {
      await updateCatalogProduct(id, {
        title: editTitle,
        priceLabel: editPrice,
      });
      setEditingId(null);
      requestCatalogRefresh();
      await load();
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
      const userId = await sessionUserId();
      setListings((prev) => {
        const next = prev.filter((p) => p.id !== id);
        if (userId) void setOfflineMyListings(userId, next);
        return next;
      });
      requestCatalogRefresh();
      void load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("removeError"),
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <p className="py-12 text-center text-sm text-kumbu-muted">{t("loading")}</p>
    );
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
      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-red-100" role="alert">
          {error}
        </p>
      )}
      <ul className="kumbu-listing-grid">
        {listings.map((p) => (
          <li key={p.id} className="kumbu-card-elevated flex flex-col overflow-hidden">
            {editingId === p.id ? (
              <div className="flex flex-1 flex-col p-4">
                <div className="space-y-3">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="kumbu-input w-full font-normal"
                  />
                  <input
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="kumbu-input w-full font-normal"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      disabled={busy}
                      onClick={() => void saveEdit(p.id)}
                      className="flex-1"
                    >
                      {tCommon("save")}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setEditingId(null)}
                    >
                      {tCommon("cancel")}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href={`/produto/${p.id}`}
                  className="relative block aspect-[4/3] overflow-hidden bg-kumbu-surface-muted"
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
                </Link>
                <div className="flex flex-1 flex-col p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/produto/${p.id}`}
                        className="line-clamp-2 text-[13px] font-bold text-kumbu-foreground hover:text-kumbu-primary"
                      >
                        {p.title}
                      </Link>
                      <p className="mt-1 text-sm font-semibold text-kumbu-primary">
                        {p.priceLabel}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <ListingRatingBadge product={p} />
                        {formatViewCount(p.viewCount) && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] text-kumbu-muted">
                            <Eye className="size-3" />
                            {formatViewCount(p.viewCount)}
                          </span>
                        )}
                      </div>
                      {p.isOutOfStock && (
                        <p className="mt-1 text-xs font-semibold text-red-600">{tProduct("outOfStock")}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        aria-label={t("highlight")}
                        onClick={() => {
                          setPromoteId(p.id);
                          setPromoteCategoryId(p.categoryId);
                        }}
                        className="flex size-9 items-center justify-center rounded-lg border border-kumbu-border text-kumbu-primary"
                      >
                        <Sparkles className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={t("edit")}
                        onClick={() => {
                          setEditingId(p.id);
                          setEditTitle(p.title);
                          setEditPrice(p.priceLabel);
                        }}
                        className="flex size-9 items-center justify-center rounded-lg border border-kumbu-border"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={t("remove")}
                        disabled={busy}
                        onClick={() => void remove(p.id)}
                        className="flex size-9 items-center justify-center rounded-lg border border-red-200 text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    className="mt-3 h-9"
                    disabled={busy}
                    onClick={() => void toggleStock(p)}
                  >
                    {p.isOutOfStock ? t("available") : tProduct("outOfStock")}
                  </Button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {promoteId && (
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
