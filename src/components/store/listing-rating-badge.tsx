import { Star } from "lucide-react";
import { formatListingRating, hasListingRating } from "@/lib/listing/display-stats";
import type { CatalogProduct } from "@/types/store";

interface ListingRatingBadgeProps {
  product: CatalogProduct;
  className?: string;
}

export function ListingRatingBadge({ product, className }: ListingRatingBadgeProps) {
  if (!hasListingRating(product)) return null;
  const label = formatListingRating(product);
  if (!label) return null;

  return (
    <span
      className={
        className ??
        "inline-flex items-center gap-0.5 text-[11px] font-medium text-kumbu-muted"
      }
    >
      <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
      {label}
    </span>
  );
}
