import { getTranslations } from "next-intl/server";
import { LegalDocument } from "@/components/legal/legal-document";
import { fetchLegalDocument } from "@/lib/legal/fetch-legal";
import {
  getLocalizedLastUpdated,
  getLocalizedLegalSections,
} from "@/lib/legal/get-localized-legal";

export default async function TermosPage() {
  const t = await getTranslations("legal");
  const [sections, lastUpdated] = await Promise.all([
    getLocalizedLegalSections("terms"),
    getLocalizedLastUpdated(),
  ]);

  const doc = await fetchLegalDocument("terms", {
    title: t("legalPages.terms.title"),
    intro: t("legalPages.terms.intro"),
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
        { href: "/privacidade", label: t("privacy") },
        { href: "/regras-publicacao", label: t("publishingRules") },
        { href: "/como-funciona", label: t("howItWorks") },
      ]}
    />
  );
}
