"use server";

import {
  serverActionError,
  serverLoginRequiredError,
} from "@/lib/i18n/server-errors";
import {
  listProductReviews,
  submitProductReview,
  submitSellerReviewReply,
} from "@/lib/site-data";
import { getServerSessionUserId } from "@/lib/server-auth";
import type { ProductReview, ProductReviewMedia } from "@/types/review";

export async function listProductReviewsAction(
  productId: string,
): Promise<
  { ok: true; reviews: ProductReview[] } | { ok: false; error: string }
> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) return { ok: false, error: await serverLoginRequiredError() };
    const reviews = await listProductReviews(productId);
    return { ok: true, reviews };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}

export async function submitProductReviewAction(
  productId: string,
  rating: number,
  comment: string | undefined,
  media: ProductReviewMedia[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) return { ok: false, error: await serverLoginRequiredError() };
    await submitProductReview(productId, rating, comment, media);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}

export async function submitSellerReviewReplyAction(
  reviewId: string,
  reply: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userId = await getServerSessionUserId();
    if (!userId) return { ok: false, error: await serverLoginRequiredError() };
    await submitSellerReviewReply(reviewId, reply);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: await serverActionError(err) };
  }
}
