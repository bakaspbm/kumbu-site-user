import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { ContaPageHeader } from "@/components/account/conta-page-header";
import { ContaPanel } from "@/components/account/conta-section";
import { MyMonetizationPaymentsPanel } from "@/components/monetization/my-payments-panel";
import { getMonetizationCatalogBackend } from "@/lib/kumbu-api/monetization";
import { isUserMonetizationVisible } from "@/lib/monetization/user-facing";

export default async function ContaPagamentosPage() {
  const t = await getTranslations("accountPages.payments");

  let visible = false;
  try {
    const catalog = await getMonetizationCatalogBackend();
    visible = isUserMonetizationVisible(catalog.chargingEnabled);
  } catch {
    visible = false;
  }
  if (!visible) {
    redirect("/conta/perfil");
  }

  return (
    <ContaPanel>
      <ContaPageHeader icon={Sparkles} title={t("title")} description={t("description")} />
      <MyMonetizationPaymentsPanel />
    </ContaPanel>
  );
}
