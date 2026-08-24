"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { AccountOrdersPanel } from "@/components/orders/account-orders-panel";

export default function ContaComprasPage() {
  const t = useTranslations("accountPages.purchases");

  return (
    <AccountOrdersPanel
      mode="purchases"
      icon={ShoppingBag}
      title={t("title")}
      description={t("description")}
      emptyTitle={t("emptyTitle")}
      emptyDescription={t("emptyDescription")}
      hrefPrefix="/conta/compras"
    />
  );
}
