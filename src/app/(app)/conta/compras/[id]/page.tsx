import { Package } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import { EmptyState } from "@/components/ui/empty-state";
import { resolveServerAuth } from "@/lib/server-page-auth";
import { getOrder } from "@/lib/site-data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompraDetailPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations("accountPages.purchases");
  const auth = await resolveServerAuth();

  if (auth.status !== "logged_in") {
    return (
      <EmptyState
        className="mt-8"
        icon={Package}
        title={t("loginPromptTitle")}
        description={t("loginPromptDesc")}
        actionLabel={t("loginAction")}
        actionHref={`/login?next=/conta/compras/${id}`}
      />
    );
  }

  const order = await getOrder(id).catch(() => null);
  if (!order || order.userId !== auth.userId) notFound();

  return (
    <OrderDetailView
      order={order}
      backHref="/conta/compras"
      backLabel={t("backLabel")}
      role="buyer"
    />
  );
}
