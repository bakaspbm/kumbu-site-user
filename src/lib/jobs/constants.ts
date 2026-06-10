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

export function isEmpregoCategory(
  categoryId: string,
  kind?: string,
  name?: string,
): boolean {
  if (categoryId === EMPREGO_CATEGORY_ID) return true;
  if (kind === "job") return true;
  const n = (name ?? "").toLowerCase();
  return n.includes("emprego") || n.includes("vaga");
}
