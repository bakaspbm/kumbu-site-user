import { getTranslations } from "next-intl/server";
import { LegalDocument } from "@/components/legal/legal-document";
import { fetchLegalDocument } from "@/lib/legal/fetch-legal";
import {
  getLocalizedLastUpdated,
  getLocalizedLegalSections,
} from "@/lib/legal/get-localized-legal";

export default async function RegrasPublicacaoPage() {
  const t = await getTranslations("legal");
  const [sections, lastUpdated] = await Promise.all([
    getLocalizedLegalSections("publishingRules"),
    getLocalizedLastUpdated(),
  ]);

  const doc = await fetchLegalDocument("publishing_rules", {
    title: t("legalPages.publishingRules.title"),
    intro: t("legalPages.publishingRules.intro"),
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
        { href: "/termos", label: t("terms") },
        { href: "/publicar", label: "Publicar anúncio" },
      ]}
    />
  );
}
