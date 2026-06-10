"use client";

import { useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { JobContractType } from "@/types/job";
import { JOB_CONTRACT_TYPES, JOB_SECTORS } from "@/lib/jobs/constants";

export function useJobContractLabel() {
  const t = useTranslations("jobs.contractTypes");
  return useCallback(
    (type: JobContractType) => t(type),
    [t],
  );
}

export function useJobSectorLabel() {
  const t = useTranslations("jobs.sectors");
  return useCallback(
    (sector: string) => {
      if ((JOB_SECTORS as readonly string[]).includes(sector)) {
        return t(sector as (typeof JOB_SECTORS)[number]);
      }
      return sector;
    },
    [t],
  );
}

export function useJobSalaryLabel() {
  const t = useTranslations("jobs.salary");
  const locale = useLocale();

  return useCallback(
    (meta: {
      salaryKz?: number | null;
      salaryMinKz?: number | null;
      salaryMaxKz?: number | null;
      salaryNegotiable?: boolean | null;
    }) => {
      const formatKz = (value: number) =>
        `${value.toLocaleString(locale)} Kz`;
      if (meta.salaryNegotiable) return t("negotiable");
      if (meta.salaryMinKz != null && meta.salaryMaxKz != null) {
        return t("range", {
          min: formatKz(meta.salaryMinKz),
          max: formatKz(meta.salaryMaxKz),
        });
      }
      if (meta.salaryKz != null) return formatKz(meta.salaryKz);
      return t("notSpecified");
    },
    [t, locale],
  );
}

export function useJobContractTypes() {
  return JOB_CONTRACT_TYPES;
}

export function useJobSectors() {
  return JOB_SECTORS;
}
