"use client";

import { useTranslations } from "next-intl";

export function useDealStatusLabel() {
  const t = useTranslations("chat");

  return function dealStatusLabel(
    status: "open" | "purchased" | "rejected" | null,
  ): string | null {
    if (status === "open") return t("dealOpen");
    if (status === "purchased") return t("dealPurchased");
    if (status === "rejected") return t("dealRejected");
    return null;
  };
}

/** @deprecated Use useDealStatusLabel in client components */
export function dealStatusLabel(status: "open" | "purchased" | "rejected" | null): string | null {
  if (status === "open") return "Negociação em curso";
  if (status === "purchased") return "Comprado";
  if (status === "rejected") return "Sem acordo";
  return null;
}
