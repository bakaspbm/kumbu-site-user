"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { OrderDetailLoader } from "@/components/orders/order-detail-loader";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VendaDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const t = useTranslations("accountPages.sales");

  return (
    <OrderDetailLoader
      orderId={id}
      role="seller"
      backHref="/conta/vendas"
      backLabel={t("backLabel")}
    />
  );
}
