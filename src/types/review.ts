export type ProductReviewMediaType = "image" | "video";

export interface ProductReviewMedia {
  type: ProductReviewMediaType;
  url: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  media: ProductReviewMedia[];
  sellerReply: string | null;
  sellerReplyAt: string | null;
  createdAt: string;
  reviewer: {
    displayName: string;
    photoUrl: string | null;
  };
}
