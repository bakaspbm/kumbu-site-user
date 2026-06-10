import type { LegalSection } from "@/lib/legal/content";
import { fetchLegalDocumentBackend } from "@/lib/kumbu-api/platform";

function formatLegalDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-PT", { dateStyle: "long" });
}

export type LegalSlug =
  | "terms"
  | "privacy"
  | "cookies"
  | "how_it_works"
  | "publishing_rules";

export interface LegalDocumentView {
  title: string;
  intro?: string;
  sections: LegalSection[];
  lastUpdated: string;
}

export async function fetchLegalDocument(
  slug: LegalSlug,
  fallback: Omit<LegalDocumentView, "lastUpdated"> & { lastUpdated?: string },
): Promise<LegalDocumentView> {
  const remote = await fetchLegalDocumentBackend(slug);
  if (remote && remote.title && remote.sections.length > 0) {
    return {
      title: remote.title,
      intro: remote.intro ?? undefined,
      sections: remote.sections,
      lastUpdated: remote.updatedAt ? formatLegalDate(remote.updatedAt) : "—",
    };
  }
  return {
    title: fallback.title,
    intro: fallback.intro,
    sections: fallback.sections as LegalSection[],
    lastUpdated: fallback.lastUpdated ? formatLegalDate(fallback.lastUpdated) : "—",
  };
}
