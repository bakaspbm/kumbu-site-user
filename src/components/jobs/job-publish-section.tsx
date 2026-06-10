"use client";

import { useTranslations } from "next-intl";
import { AngolaProvinceMunicipalityFields } from "@/components/geo/angola-province-municipality-fields";
import { JOB_SECTORS } from "@/lib/jobs/constants";
import {
  useJobContractLabel,
  useJobContractTypes,
  useJobSectorLabel,
} from "@/lib/i18n/use-job-labels";
import type { JobContractType, JobMeta } from "@/types/job";

export interface JobPublishState {
  title: string;
  description: string;
  province: string;
  municipality: string;
  contractType: JobContractType;
  sector: string;
  salary: string;
  remote: boolean;
  requirements: string;
  benefits: string;
  positionsCount: string;
}

export const defaultJobPublishState = (): JobPublishState => ({
  title: "",
  description: "",
  province: "Luanda",
  municipality: "",
  contractType: "tempo_inteiro",
  sector: JOB_SECTORS[0],
  salary: "",
  remote: false,
  requirements: "",
  benefits: "",
  positionsCount: "1",
});

export function buildJobMeta(state: JobPublishState): JobMeta {
  const num = (s: string) => (s.trim() ? Number(s.replace(/\D/g, "")) : null);
  return {
    contractType: state.contractType,
    sector: state.sector || null,
    province: state.province || null,
    municipality: state.municipality || null,
    salaryKz: num(state.salary),
    remote: state.remote,
    requirements: state.requirements.trim() || null,
    benefits: state.benefits.trim() || null,
    positionsCount: num(state.positionsCount) ?? 1,
  };
}

export function validateJobPublish(
  state: JobPublishState,
  t?: (key: string) => string,
): string | null {
  const msg = (key: string, fallback: string) =>
    t ? t(`validation.${key}`) : fallback;
  if (!state.title.trim()) return msg("titleRequired", "Indique o título da vaga.");
  if (!state.municipality.trim()) return msg("municipalityRequired", "Indique o município.");
  return null;
}

export function jobPriceLabelFromMeta(meta: JobMeta): string {
  return formatJobSalary(meta);
}

function formatJobSalary(meta: JobMeta): string {
  const fmt = (n: number) => new Intl.NumberFormat("pt-AO").format(n);
  if (meta.salaryKz) return `${fmt(meta.salaryKz)} Kz`;
  const min = meta.salaryMinKz;
  const max = meta.salaryMaxKz;
  if (min && max) return `${fmt(min)} – ${fmt(max)} Kz`;
  if (min) return `${fmt(min)} Kz`;
  if (max) return `${fmt(max)} Kz`;
  return "Salário a combinar";
}

interface JobPublishSectionProps {
  state: JobPublishState;
  onChange: (patch: Partial<JobPublishState>) => void;
}

export function JobPublishSection({ state, onChange }: JobPublishSectionProps) {
  const t = useTranslations("jobs.publish");
  const contractLabel = useJobContractLabel();
  const sectorLabel = useJobSectorLabel();
  const contractTypes = useJobContractTypes();

  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {t("jobTitle")}
        <input
          required
          value={state.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="kumbu-input font-normal"
          placeholder={t("jobTitlePlaceholder")}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {t("sector")}
        <select
          value={state.sector}
          onChange={(e) => onChange({ sector: e.target.value })}
          className="kumbu-input font-normal"
        >
          {JOB_SECTORS.map((s) => (
            <option key={s} value={s}>
              {sectorLabel(s)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {t("contractType")}
        <select
          value={state.contractType}
          onChange={(e) =>
            onChange({ contractType: e.target.value as JobContractType })
          }
          className="kumbu-input font-normal"
        >
          {contractTypes.map((k) => (
            <option key={k} value={k}>
              {contractLabel(k)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {t("salary")}
        <input
          inputMode="numeric"
          value={state.salary}
          onChange={(e) => onChange({ salary: e.target.value.replace(/\D/g, "") })}
          className="kumbu-input font-normal"
          placeholder={t("salaryPlaceholder")}
        />
      </label>

      <AngolaProvinceMunicipalityFields
        province={state.province}
        municipality={state.municipality}
        onProvinceChange={(province) => onChange({ province })}
        onMunicipalityChange={(municipality) => onChange({ municipality })}
      />

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={state.remote}
          onChange={(e) => onChange({ remote: e.target.checked })}
          className="size-4 rounded"
        />
        {t("remotePossible")}
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {t("requirements")}
        <textarea
          value={state.requirements}
          onChange={(e) => onChange({ requirements: e.target.value })}
          className="kumbu-input min-h-[72px] font-normal"
          placeholder={t("requirementsPlaceholder")}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {t("benefits")}
        <textarea
          value={state.benefits}
          onChange={(e) => onChange({ benefits: e.target.value })}
          className="kumbu-input min-h-[60px] font-normal"
          placeholder={t("benefitsPlaceholder")}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {t("description")}
        <textarea
          value={state.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="kumbu-input min-h-[100px] font-normal"
          placeholder={t("descriptionPlaceholder")}
        />
      </label>
    </div>
  );
}
