import { Store } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ContaLoginPrompt } from "@/components/account/conta-login-prompt";
import { ContaPageHeader } from "@/components/account/conta-page-header";
import { ContaPanel } from "@/components/account/conta-section";
import { OrderList } from "@/components/orders/order-list";
import { resolveServerAuth } from "@/lib/server-page-auth";
import { listSalesOrders } from "@/lib/site-data";

export default async function ContaVendasPage() {
  const t = await getTranslations("accountPages.sales");
  const auth = await resolveServerAuth();

  const orders =
    auth.status === "logged_in"
      ? await listSalesOrders().catch(() => [])
      : [];

  if (auth.status !== "logged_in") {
    return <ContaLoginPrompt title={t("loginTitle")} nextPath="/conta/vendas" icon={Store} />;
  }

  return (
    <ContaPanel>
      <ContaPageHeader
        icon={Store}
        title={t("title")}
        description={t("description")}
      />
      <OrderList
        orders={orders}
        hrefPrefix="/conta/vendas"
        counterparty="buyer"
        emptyTitle={t("emptyTitle")}
        emptyDescription={t("emptyDescription")}
      />
    </ContaPanel>
  );
}
