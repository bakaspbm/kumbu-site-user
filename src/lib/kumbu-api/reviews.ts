import type { ProductReview, ProductReviewMedia } from "@/types/review";
import { getKumbuApiClient, type KumbuApiClient } from "@/lib/kumbu-api/client";

type ReviewDto = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  media?: ProductReviewMedia[] | null;
  sellerReply?: string | null;
  sellerReplyAt?: string | null;
  createdAt?: string | null;
  reviewerName?: string | null;
  reviewerPhotoUrl?: string | null;
};

type CanReviewDto = {
  canReview?: boolean | null;
};

function clientOrThrow(): KumbuApiClient {
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  return client;
}

function toReview(row: ReviewDto): ProductReview {
  const rawMedia = row.media;
  const media: ProductReviewMedia[] = Array.isArray(rawMedia)
    ? rawMedia
        .filter((m): m is ProductReviewMedia => {
          if (!m || typeof m !== "object") return false;
          const item = m as ProductReviewMedia;
          return (item.type === "image" || item.type === "video") && typeof item.url === "string";
        })
        .map((m) => ({
          type: m.type === "video" ? "video" : "image",
          url: m.url,
        }))
    : [];
  return {
    id: String(row.id),
    productId: String(row.productId),
    userId: String(row.userId),
    rating: Number(row.rating) || 0,
    comment: row.comment ?? null,
    media,
    sellerReply: row.sellerReply ?? null,
    sellerReplyAt: row.sellerReplyAt ?? null,
    createdAt: String(row.createdAt ?? new Date().toISOString()),
    reviewer: {
      displayName: row.reviewerName ?? "Comprador",
      photoUrl: row.reviewerPhotoUrl ?? null,
    },
  };
}

export async function listProductReviewsBackend(
  productId: string,
  _limit = 40,
): Promise<ProductReview[]> {
  const client = clientOrThrow();
  const rows = await client.request<ReviewDto[]>(`/reviews/products/${encodeURIComponent(productId)}`, {
    auth: false,
  });
  return (rows ?? []).map(toReview);
}

export async function buyerCanReviewProductBackend(productId: string): Promise<boolean> {
  const client = clientOrThrow();
  const row = await client.request<CanReviewDto>(
    `/reviews/products/${encodeURIComponent(productId)}/can-review`,
  );
  return row.canReview === true;
}

export async function submitProductReviewBackend(
  productId: string,
  rating: number,
  comment: string | undefined,
  media: ProductReviewMedia[],
): Promise<void> {
  const client = clientOrThrow();
  await client.request<void>(`/reviews/products/${encodeURIComponent(productId)}`, {
    method: "POST",
    body: JSON.stringify({
      rating,
      comment: comment ?? null,
      media: media.map((item) => ({ type: item.type, url: item.url })),
    }),
  });
}

export async function submitSellerReviewReplyBackend(
  reviewId: string,
  reply: string,
): Promise<void> {
  const client = clientOrThrow();
  await client.request<void>(`/reviews/${encodeURIComponent(reviewId)}/reply`, {
    method: "POST",
    body: JSON.stringify({ reply }),
  });
}
