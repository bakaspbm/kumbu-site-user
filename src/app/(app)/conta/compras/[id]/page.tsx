"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { OrderDetailLoader } from "@/components/orders/order-detail-loader";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CompraDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const t = useTranslations("accountPages.purchases");

  return (
    <OrderDetailLoader
      orderId={id}
      role="buyer"
      backHref="/conta/compras"
      backLabel={t("backLabel")}
    />
  );
}
