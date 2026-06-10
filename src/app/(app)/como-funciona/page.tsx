import { getTranslations } from "next-intl/server";
import { LegalDocument } from "@/components/legal/legal-document";
import { fetchLegalDocument } from "@/lib/legal/fetch-legal";
import {
  getLocalizedLastUpdated,
  getLocalizedLegalSections,
} from "@/lib/legal/get-localized-legal";

export default async function ComoFuncionaPage() {
  const t = await getTranslations("legal");
  const [sections, lastUpdated] = await Promise.all([
    getLocalizedLegalSections("howItWorks"),
    getLocalizedLastUpdated(),
  ]);

  const doc = await fetchLegalDocument("how_it_works", {
    title: t("legalPages.howItWorks.title"),
    intro: t("legalPages.howItWorks.intro"),
    sections,
    lastUpdated,
  });

  return (
    <LegalDocument
      title={doc.title}
      intro={doc.intro}
      sections={doc.sections}
      lastUpdated={doc.lastUpdated !== "—" ? doc.lastUpdated : lastUpdated}
      relatedLinks={[
        { href: "/regras-publicacao", label: t("publishingRules") },
        { href: "/support", label: "Suporte" },
      ]}
    />
  );
}
