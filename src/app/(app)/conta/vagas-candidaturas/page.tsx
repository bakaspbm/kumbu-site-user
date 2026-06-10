import { Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ContaPageHeader } from "@/components/account/conta-page-header";
import { ContaPanel } from "@/components/account/conta-section";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmployerApplicationsManager } from "@/components/jobs/employer-applications-manager";

export default async function VagasCandidaturasPage() {
  const t = await getTranslations("account");

  return (
    <RequireAuth>
      <ContaPanel>
        <ContaPageHeader
          icon={Users}
          title={t("jobApplicantsTitle")}
          description={t("jobApplicantsDescription")}
        />
        <EmployerApplicationsManager />
      </ContaPanel>
    </RequireAuth>
  );
}
