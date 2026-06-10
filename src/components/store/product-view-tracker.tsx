"use client";

import { useEffect, useRef } from "react";
import { recordProductViewAction } from "@/app/actions/analytics";

interface ProductViewTrackerProps {
  productId: string;
  onViewCount?: (count: number | null) => void;
}

export function ProductViewTracker({ productId, onViewCount }: ProductViewTrackerProps) {
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current || !productId) return;
    const key = `kumbu_view_${productId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
    }
    doneRef.current = true;

    void recordProductViewAction(productId).then((result) => {
      if (result.ok && onViewCount) onViewCount(result.viewCount);
    });
  }, [productId, onViewCount]);

  return null;
}
