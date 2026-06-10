import { Package } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BackHeader } from "@/components/layout/back-header";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import { resolveServerAuth } from "@/lib/server-page-auth";
import { getOrder } from "@/lib/site-data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations("orders");
  const auth = await resolveServerAuth();

  if (auth.status !== "logged_in") {
    return (
      <>
        <BackHeader title={t("orderTitle")} href="/orders" />
        <main className="kumbu-container py-8">
          <EmptyState
            icon={Package}
            title={t("loginTitle")}
            description={t("loginDetailDescription")}
            actionLabel={t("loginAction")}
            actionHref={`/login?next=/orders/${id}`}
          />
        </main>
      </>
    );
  }

  let order: Awaited<ReturnType<typeof getOrder>> = null;
  try {
    order = await getOrder(id);
  } catch {
    order = null;
  }

  if (!order) notFound();

  return (
    <OrderDetailView
      order={order}
      backHref="/orders"
      backLabel={t("backToAll")}
      role="buyer"
    />
  );
}
