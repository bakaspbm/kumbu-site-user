import type { JobContractType } from "@/types/job";

export const EMPREGO_CATEGORY_ID = "emprego";

export const JOB_CONTRACT_TYPES: JobContractType[] = [
  "tempo_inteiro",
  "tempo_parcial",
  "estagio",
  "freelance",
  "remoto",
];

export const JOB_SECTORS = [
  "administration",
  "commercial_sales",
  "construction",
  "accounting",
  "education",
  "engineering",
  "hospitality",
  "it",
  "logistics",
  "marketing",
  "hr",
  "health",
  "security",
  "other",
] as const;

export type JobSectorKey = (typeof JOB_SECTORS)[number];

const JOB_CATEGORY_IDS = new Set([
  EMPREGO_CATEGORY_ID,
  "empregos",
  "vagas",
  "vaga",
  "jobs",
  "job",
]);

export function isEmpregoCategory(
  categoryId?: string | null,
  kind?: string,
  name?: string,
): boolean {
  const id = (categoryId ?? "").trim().toLowerCase();
  if (id && JOB_CATEGORY_IDS.has(id)) return true;
  if ((kind ?? "").trim().toLowerCase() === "job") return true;
  const n = (name ?? "").toLowerCase();
  return (
    n.includes("emprego") ||
    n.includes("vaga") ||
    n.includes("job") ||
    n.includes("emploi")
  );
}
