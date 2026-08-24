"use client";

import { Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { AccountOrdersPanel } from "@/components/orders/account-orders-panel";

export default function ContaVendasPage() {
  const t = useTranslations("accountPages.sales");

  return (
    <AccountOrdersPanel
      mode="sales"
      icon={Store}
      title={t("title")}
      description={t("description")}
      emptyTitle={t("emptyTitle")}
      emptyDescription={t("emptyDescription")}
      hrefPrefix="/conta/vendas"
    />
  );
}
