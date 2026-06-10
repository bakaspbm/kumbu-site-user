"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import {
  listProductReviewsAction,
  submitSellerReviewReplyAction,
} from "@/app/actions/reviews";
import { ProductReviewForm } from "@/components/store/product-review-form";
import { ReviewMediaGallery } from "@/components/store/review-media-gallery";
import { Button } from "@/components/ui/button";
import {
  getReviewEmptyHint,
  resolveListingKind,
  type ListingKindForReview,
} from "@/lib/listing/review-copy";
import { buyerCanReviewProductBackend } from "@/lib/kumbu-api/reviews";
import { cn } from "@/lib/utils";
import type { ProductReview } from "@/types/review";

interface ProductReviewsSectionProps {
  productId: string;
  isOwner: boolean;
  showReviewForm: boolean;
  listingKind?: ListingKindForReview;
  categoryId?: string;
}

function Stars({ rating }: { rating: number }) {
  const t = useTranslations("product");
  return (
    <span className="inline-flex gap-0.5" aria-label={t("starsOfFive", { rating })}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "size-4",
            n <= rating ? "fill-amber-400 text-amber-400" : "text-kumbu-border",
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}

function SellerReplyForm({
  reviewId,
  onSaved,
}: {
  reviewId: string;
  onSaved: () => void;
}) {
  const t = useTranslations("product");
  const tCommon = useTranslations("common");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result = await submitSellerReviewReplyAction(reviewId, reply);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setReply("");
    onSaved();
  }

  return (
    <form onSubmit={submit} className="mt-3 rounded-xl bg-kumbu-secondary/50 p-3">
      <p className="text-xs font-semibold text-kumbu-muted">{t("sellerReplyLabel")}</p>
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder={t("sellerReplyPlaceholder")}
        className="kumbu-input mt-2 min-h-[64px] w-full text-sm"
        maxLength={2000}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      <Button type="submit" className="mt-2 h-8 text-xs" disabled={busy || !reply.trim()}>
        {busy ? tCommon("sending") : t("publishReply")}
      </Button>
    </form>
  );
}

function ReviewCard({
  review,
  isOwner,
  onRefresh,
}: {
  review: ProductReview;
  isOwner: boolean;
  onRefresh: () => void;
}) {
  const t = useTranslations("product");
  const date = new Date(review.createdAt).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <li className="rounded-2xl border border-kumbu-border bg-kumbu-surface p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-kumbu-primary text-sm font-bold text-white">
          {review.reviewer.displayName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-kumbu-foreground">{review.reviewer.displayName}</p>
            <Stars rating={review.rating} />
            <span className="text-xs text-kumbu-muted">{date}</span>
          </div>
          {review.comment && (
            <p className="mt-2 text-sm leading-relaxed text-kumbu-muted">{review.comment}</p>
          )}
          <ReviewMediaGallery media={review.media} />
          {review.sellerReply && (
            <div className="mt-3 rounded-xl border-l-4 border-kumbu-primary bg-kumbu-secondary/40 px-3 py-2">
              <p className="text-xs font-bold text-kumbu-primary">{t("sellerReplyTitle")}</p>
              <p className="mt-1 text-sm text-kumbu-foreground">{review.sellerReply}</p>
              {review.sellerReplyAt && (
                <p className="mt-1 text-[11px] text-kumbu-muted">
                  {new Date(review.sellerReplyAt).toLocaleDateString("pt-PT")}
                </p>
              )}
            </div>
          )}
          {isOwner && !review.sellerReply && (
            <SellerReplyForm reviewId={review.id} onSaved={onRefresh} />
          )}
        </div>
      </div>
    </li>
  );
}

export function ProductReviewsSection({
  productId,
  isOwner,
  showReviewForm,
  listingKind,
  categoryId,
}: ProductReviewsSectionProps) {
  const t = useTranslations("product");
  const kind = resolveListingKind(listingKind, categoryId);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [reviewsResult, canReviewResult] = await Promise.all([
      listProductReviewsAction(productId),
      showReviewForm
        ? buyerCanReviewProductBackend(productId).catch(() => false)
        : Promise.resolve(false),
    ]);
    setLoading(false);
    if (!reviewsResult.ok) {
      setError(reviewsResult.error);
      setReviews([]);
      setCanReview(false);
      return;
    }
    setReviews(reviewsResult.reviews);
    setCanReview(canReviewResult);
  }, [productId, showReviewForm]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section
      id="avaliacoes"
      className="relative mt-8 scroll-mt-24 border-t border-kumbu-border pt-8"
      aria-labelledby="avaliacoes-titulo"
    >
      <h2
        id="avaliacoes-titulo"
        className="text-lg font-extrabold text-kumbu-foreground"
      >
        {t("reviewsTitle")} {reviews.length > 0 && `(${reviews.length})`}
      </h2>

      {loading && (
        <p className="mt-3 text-sm text-kumbu-muted">{t("loadingReviews")}</p>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && reviews.length === 0 && !showReviewForm && (
        <p className="mt-3 text-sm text-kumbu-muted">{t("noReviews")}</p>
      )}

      {!loading && !error && reviews.length === 0 && showReviewForm && !canReview && (
        <p className="mt-3 text-sm text-kumbu-muted">{getReviewEmptyHint(kind, t)}</p>
      )}

      {reviews.length > 0 && (
        <ul className="mt-4 space-y-4">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              isOwner={isOwner}
              onRefresh={() => void load()}
            />
          ))}
        </ul>
      )}

      {showReviewForm && canReview && (
        <ProductReviewForm
          productId={productId}
          listingKind={kind}
          onSubmitted={() => void load()}
        />
      )}

      {showReviewForm && !loading && !canReview && reviews.length > 0 && (
        <p className="mt-4 text-sm text-kumbu-muted">{getReviewEmptyHint(kind, t)}</p>
      )}
    </section>
  );
}
