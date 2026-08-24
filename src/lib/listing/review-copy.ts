import { isEmpregoCategory } from "@/lib/jobs/constants";
import { isImoveisCategory } from "@/lib/property/constants";

export type ListingKindForReview = "general" | "property" | "job";

export type ReviewCopyTranslator = (
  key:
    | `reviewCommentPlaceholder.${ListingKindForReview}`
    | `reviewFormIntro.${ListingKindForReview}`
    | `reviewEmptyHint.${ListingKindForReview}`,
) => string;

export function resolveListingKind(
  listingKind?: string | null,
  categoryId?: string,
): ListingKindForReview {
  if (listingKind === "property" || isImoveisCategory(categoryId)) return "property";
  if (listingKind === "job" || isEmpregoCategory(categoryId)) return "job";
  return "general";
}

export function getReviewCommentPlaceholder(
  kind: ListingKindForReview,
  t: ReviewCopyTranslator,
): string {
  return t(`reviewCommentPlaceholder.${kind}`);
}

export function getReviewFormIntro(
  kind: ListingKindForReview,
  t: ReviewCopyTranslator,
): string {
  return t(`reviewFormIntro.${kind}`);
}

export function getReviewEmptyHint(
  kind: ListingKindForReview,
  t: ReviewCopyTranslator,
): string {
  return t(`reviewEmptyHint.${kind}`);
}
