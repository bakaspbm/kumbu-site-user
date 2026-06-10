import { getTranslations } from "next-intl/server";
import { LegalDocument } from "@/components/legal/legal-document";
import { fetchLegalDocument } from "@/lib/legal/fetch-legal";
import {
  getLocalizedLastUpdated,
  getLocalizedLegalSections,
} from "@/lib/legal/get-localized-legal";

export default async function CookiesPage() {
  const t = await getTranslations("legal");
  const [sections, lastUpdated] = await Promise.all([
    getLocalizedLegalSections("cookies"),
    getLocalizedLastUpdated(),
  ]);

  const doc = await fetchLegalDocument("cookies", {
    title: t("legalPages.cookies.title"),
    intro: t("legalPages.cookies.intro"),
    sections,
    lastUpdated,
  });

  return (
    <LegalDocument
      title={doc.title}
      intro={doc.intro}
      sections={doc.sections}
      lastUpdated={doc.lastUpdated !== "—" ? doc.lastUpdated : lastUpdated}
      relatedLinks={[{ href: "/privacidade", label: t("privacy") }]}
    />
  );
}
