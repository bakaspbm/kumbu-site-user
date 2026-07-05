"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MessageCircle, Share2 } from "lucide-react";
import {
  PropertyRentalActions,
  PropertySaleActions,
} from "@/components/property/property-rental-actions";
import { JobApplyPanel } from "@/components/jobs/job-apply-panel";
import { isJobListing } from "@/lib/jobs/category";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { FavoriteButton } from "@/components/store/favorite-button";
import { isPropertyListing } from "@/lib/property/category";
import { isSaleOnlyProperty } from "@/lib/property/constants";
import { Button } from "@/components/ui/button";
import { startConversationAction } from "@/app/actions/start-conversation";
import { promiseWithTimeout } from "@/lib/promise-timeout";
import { useAuth } from "@/contexts/auth-context";
import type { CatalogProduct } from "@/types/store";

interface ListingContactActionsProps {
  product: CatalogProduct;
}

export function ListingContactActions({ product }: ListingContactActionsProps) {
  const t = useTranslations("store");
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isOwn = isLoggedIn && user?.id === product.sellerId;
  const location = product.deliveryText?.trim() || product.seller?.city || "Angola";
  const meta = product.propertyMeta;
  const isProperty = isPropertyListing(product) && meta;
  const saleOnlyLand = meta ? isSaleOnlyProperty(meta) : false;
  const isJob = isJobListing(product);

  if (isOwn) {
    return (
      <div className="space-y-3">
        <p className="rounded-xl bg-kumbu-secondary px-4 py-3 text-sm text-kumbu-muted">
          {t("ownListing")}
        </p>
        {isJob ? (
          <Button href="/conta/vagas-candidaturas" fullWidth variant="secondary" className="h-12">
            {t("viewApplicants")}
          </Button>
        ) : (
          <Button href="/conta/anuncios" fullWidth variant="secondary" className="h-12">
            {t("myListings")}
          </Button>
        )}
      </div>
    );
  }

  async function handleMessage() {
    setToast(null);
    if (!isLoggedIn || !user) {
      router.push(`/login?next=/produto/${product.id}`);
      return;
    }
    const sellerId = product.sellerId?.trim();
    if (!sellerId) {
      setToast(t("sellerUnavailable"));
      return;
    }

    setBusy(true);
    try {
      const result = await promiseWithTimeout(
        startConversationAction(product.id, sellerId),
        15_000,
        t("messageTimeout"),
      );

      if (!result.ok) {
        if (result.needsLogin) {
          router.push(`/login?next=/produto/${product.id}`);
          return;
        }
        setToast(result.error);
        return;
      }

      router.push(`/mensagens/${result.conversationId}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("startConversationError");
      setToast(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    const url = window.location.href;
    const text = `${product.title} — ${product.priceLabel} · ${location}`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: product.title, text, url });
        return;
      }
    } catch {
      /* cancelado ou indisponível */
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast(t("linkCopied"));
    } catch {
      setToast(url);
    }
  }

  if (isJob) {
    return (
      <div className="space-y-4">
        <JobApplyPanel job={product} />
        <Button
          type="button"
          variant="ghost"
          fullWidth
          className="h-11 gap-2 border border-kumbu-border"
          onClick={handleShare}
        >
          <Share2 className="size-4" />
          {t("shareJob")}
        </Button>
      </div>
    );
  }

  if (isProperty && meta.listingIntent === "rent" && !saleOnlyLand) {
    return (
      <div className="space-y-4">
        <PropertyRentalActions product={product} meta={meta} />
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            fullWidth
            variant="secondary"
            className="h-11 gap-2"
            disabled={busy}
            onClick={() => void handleMessage()}
          >
            <MessageCircle className="size-4" />
            {busy ? t("opening") : t("message")}
          </Button>
          <FavoriteButton productId={product.id} className="h-11 w-full justify-center" />
        </div>
        <ContactToast message={toast} />
      </div>
    );
  }

  if (isProperty && (meta.listingIntent === "sale" || saleOnlyLand)) {
    return (
      <div className="space-y-4">
        <PropertySaleActions product={product} />
        <Button
          type="button"
          fullWidth
          variant="secondary"
          className="h-12 gap-2"
          disabled={busy}
          onClick={() => void handleMessage()}
        >
          <MessageCircle className="size-5" />
          {busy ? t("openingChat") : t("message")}
        </Button>
        <FavoriteButton productId={product.id} />
        <ContactToast message={toast} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        fullWidth
        className="h-12 gap-2"
        disabled={busy}
        onClick={() => void handleMessage()}
      >
        <MessageCircle className="size-5" />
        {busy ? t("openingChat") : t("message")}
      </Button>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          className="h-11 flex-1 gap-2 border border-kumbu-border"
          onClick={handleShare}
        >
          <Share2 className="size-4" />
          {t("share")}
        </Button>
        <FavoriteButton productId={product.id} className="shrink-0" />
      </div>

      <div className="border-t border-kumbu-border pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-kumbu-muted">
          {t("buyOnline")}
        </p>
        <AddToCartButton product={product} />
      </div>

      <ContactToast message={toast} />
    </div>
  );
}

function ContactToast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-xl border border-red-500/40 bg-red-950/50 px-3 py-2 text-sm font-medium text-red-200"
    >
      {message}
    </p>
  );
}
