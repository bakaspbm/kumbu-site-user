import { Crown } from "lucide-react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ContaPageHeader } from "@/components/account/conta-page-header";
import { ContaPanel } from "@/components/account/conta-section";
import { RequireAuth } from "@/components/auth/require-auth";
import { VipUpgradePanel } from "@/components/monetization/vip-upgrade-panel";
import { getMonetizationCatalogBackend } from "@/lib/kumbu-api/monetization";
import { isUserMonetizationVisible } from "@/lib/monetization/user-facing";

type Props = {
  searchParams: Promise<{ category?: string; limit?: string }>;
};

export default async function ContaVipPage({ searchParams }: Props) {
  const t = await getTranslations("accountPages.vip");
  const sp = await searchParams;
  const categoryId = sp.category ?? undefined;
  const limitReached = sp.limit === "1";

  let visible = false;
  try {
    const catalog = await getMonetizationCatalogBackend(categoryId);
    visible = isUserMonetizationVisible(catalog.chargingEnabled);
  } catch {
    visible = false;
  }
  if (!visible) {
    redirect("/conta/perfil");
  }

  return (
    <RequireAuth>
      <ContaPanel>
        <ContaPageHeader icon={Crown} title={t("title")} description={t("description")} />
        <VipUpgradePanel categoryId={categoryId} limitReached={limitReached} />
      </ContaPanel>
    </RequireAuth>
  );
}
