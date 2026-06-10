"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";

export function useOrderStatusLabel() {
  const t = useTranslations("orders.status");

  return useCallback(
    (status: string) => {
      const key = status.toLowerCase();
      if (key === "completed") return t("delivered");
      if (key in { processing: 1, shipping: 1, delivered: 1, cancelled: 1 }) {
        return t(key as "processing" | "shipping" | "delivered" | "cancelled");
      }
      return status;
    },
    [t],
  );
}
