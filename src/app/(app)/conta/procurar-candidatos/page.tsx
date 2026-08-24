import { UserSearch } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ContaPageHeader } from "@/components/account/conta-page-header";
import { ContaPanel } from "@/components/account/conta-section";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmployerCandidateSearch } from "@/components/jobs/employer-candidate-search";

export default async function ProcurarCandidatosPage() {
  const t = await getTranslations("account");

  return (
    <RequireAuth>
      <ContaPanel>
        <ContaPageHeader
          icon={UserSearch}
          title={t("searchCandidatesTitle")}
          description={t("searchCandidatesDescription")}
        />
        <EmployerCandidateSearch embedded />
      </ContaPanel>
    </RequireAuth>
  );
}
