import { Bell } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ContaPageHeader } from "@/components/account/conta-page-header";
import { ContaPanel } from "@/components/account/conta-section";
import { NotificationsList } from "@/components/notifications/notifications-list";

export default async function ContaNotificacoesPage() {
  const t = await getTranslations("accountPages.notifications");

  return (
    <ContaPanel>
      <ContaPageHeader
        icon={Bell}
        title={t("title")}
        description={t("description")}
      />
      <NotificationsList />
    </ContaPanel>
  );
}
