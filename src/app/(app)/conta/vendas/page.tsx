import { Store } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ContaLoginPrompt } from "@/components/account/conta-login-prompt";
import { ContaPageHeader } from "@/components/account/conta-page-header";
import { ContaPanel } from "@/components/account/conta-section";
import { OrderList } from "@/components/orders/order-list";
import { UserFacingErrorAlert } from "@/components/ui/user-facing-error-alert";
import { resolveUserFacingErrorServer } from "@/lib/i18n/format-error-server";
import { resolveServerAuth } from "@/lib/server-page-auth";
import { listSalesOrders } from "@/lib/site-data";

export default async function ContaVendasPage() {
  const t = await getTranslations("accountPages.sales");
  const auth = await resolveServerAuth();

  let orders: Awaited<ReturnType<typeof listSalesOrders>> = [];
  let loadError = null;

  if (auth.status === "logged_in") {
    try {
      orders = await listSalesOrders();
    } catch (err) {
      loadError = await resolveUserFacingErrorServer(err);
    }
  }

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
      {loadError ? <UserFacingErrorAlert error={loadError} className="mb-4" /> : null}
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
