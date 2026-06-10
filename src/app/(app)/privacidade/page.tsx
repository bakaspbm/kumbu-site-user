import { getTranslations } from "next-intl/server";
import { LegalDocument } from "@/components/legal/legal-document";
import { fetchLegalDocument } from "@/lib/legal/fetch-legal";
import {
  getLocalizedLastUpdated,
  getLocalizedLegalSections,
} from "@/lib/legal/get-localized-legal";

export default async function PrivacidadePage() {
  const t = await getTranslations("legal");
  const [sections, lastUpdated] = await Promise.all([
    getLocalizedLegalSections("privacy"),
    getLocalizedLastUpdated(),
  ]);

  const doc = await fetchLegalDocument("privacy", {
    title: t("legalPages.privacy.title"),
    intro: t("legalPages.privacy.intro"),
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
        { href: "/cookies", label: t("cookies") },
        { href: "/support", label: "Suporte" },
      ]}
    />
  );
}
