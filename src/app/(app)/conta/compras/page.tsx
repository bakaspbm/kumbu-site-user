import { ShoppingBag } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ContaLoginPrompt } from "@/components/account/conta-login-prompt";
import { ContaPageHeader } from "@/components/account/conta-page-header";
import { ContaPanel } from "@/components/account/conta-section";
import { OrderList } from "@/components/orders/order-list";
import { resolveServerAuth } from "@/lib/server-page-auth";
import { listPurchaseOrders } from "@/lib/site-data";

export default async function ContaComprasPage() {
  const t = await getTranslations("accountPages.purchases");
  const auth = await resolveServerAuth();

  const orders =
    auth.status === "logged_in"
      ? await listPurchaseOrders().catch(() => [])
      : [];

  if (auth.status !== "logged_in") {
    return <ContaLoginPrompt title={t("loginTitle")} nextPath="/conta/compras" icon={ShoppingBag} />;
  }

  return (
    <ContaPanel>
      <ContaPageHeader
        icon={ShoppingBag}
        title={t("title")}
        description={t("description")}
      />
      <OrderList
        orders={orders}
        hrefPrefix="/conta/compras"
        counterparty="seller"
        emptyTitle={t("emptyTitle")}
        emptyDescription={t("emptyDescription")}
      />
    </ContaPanel>
  );
}
