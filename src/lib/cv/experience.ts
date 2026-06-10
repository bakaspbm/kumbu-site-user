import type { CvExperienceEntry } from "@/types/job";

export const emptyExperience = (): CvExperienceEntry => ({
  company: "",
  position: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
});

export function normalizeExperience(raw: unknown): CvExperienceEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const r = item as Record<string, unknown>;
      const current = Boolean(r.current);
      return {
        company: String(r.company ?? "").trim(),
        position: String(r.position ?? r.role ?? "").trim(),
        startDate: String(r.startDate ?? "").trim(),
        endDate: current ? null : String(r.endDate ?? "").trim() || null,
        current,
        description: String(r.description ?? "").trim(),
      };
    })
    .filter((e) => e.company || e.position);
}

export function formatExperiencePeriod(exp: CvExperienceEntry): string {
  const start = formatMonthYear(exp.startDate);
  const end = exp.current ? "Actual" : formatMonthYear(exp.endDate ?? "");
  if (start && end) return `${start} – ${end}`;
  if (start) return `${start} – ${exp.current ? "Actual" : "…"}`;
  return exp.period ?? "";
}

function formatMonthYear(ym: string | null | undefined): string {
  if (!ym?.trim()) return "";
  const [y, m] = ym.split("-");
  if (!y) return ym;
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  const mi = Number(m);
  if (mi >= 1 && mi <= 12) return `${months[mi - 1]} ${y}`;
  return ym;
}

export function validateExperiences(list: CvExperienceEntry[]): string | null {
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    if (!e.company.trim()) return `Experiência ${i + 1}: indique a empresa.`;
    if (!e.position.trim()) return `Experiência ${i + 1}: indique o cargo.`;
    if (!e.startDate.trim()) return `Experiência ${i + 1}: indique quando começou.`;
    if (!e.current && !e.endDate?.trim()) {
      return `Experiência ${i + 1}: indique quando terminou ou marque «Ainda trabalho aqui».`;
    }
    if (!e.description.trim()) return `Experiência ${i + 1}: descreva o que fazia.`;
  }
  return null;
}
