import { getTranslations } from "next-intl/server";
import type { LegalSection, ReportReasonId } from "./content";

export type LegalContentType =
  | "terms"
  | "privacy"
  | "cookies"
  | "howItWorks"
  | "publishingRules";

export async function getLocalizedLegalSections(
  type: LegalContentType,
): Promise<LegalSection[]> {
  const t = await getTranslations("legalContent");
  return t.raw(type) as LegalSection[];
}

export async function getLocalizedReportReasons(): Promise<
  { id: ReportReasonId; label: string }[]
> {
  const t = await getTranslations("legalContent");
  return t.raw("reportReasons") as { id: ReportReasonId; label: string }[];
}

export async function getLocalizedLastUpdated(): Promise<string> {
  const t = await getTranslations("legalContent");
  return t("lastUpdated");
}
