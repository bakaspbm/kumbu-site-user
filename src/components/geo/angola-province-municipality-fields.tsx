"use client";

import { useTranslations } from "next-intl";
import {
  listAngolaMunicipalities,
  listAngolaProvinces,
  municipalityOptionsForProvince,
} from "@/lib/geo/angola-locations";
import { cn } from "@/lib/utils";

interface AngolaProvinceMunicipalityFieldsProps {
  province: string;
  municipality: string;
  onProvinceChange: (province: string) => void;
  onMunicipalityChange: (municipality: string) => void;
  provinceLabel?: string;
  municipalityLabel?: string;
  provincePlaceholder?: string;
  municipalityPlaceholder?: string;
  allowEmptyProvince?: boolean;
  allowEmptyMunicipality?: boolean;
  municipalityRequired?: boolean;
  provinceRequired?: boolean;
  className?: string;
  gridClassName?: string;
  selectClassName?: string;
}

export function AngolaProvinceMunicipalityFields({
  province,
  municipality,
  onProvinceChange,
  onMunicipalityChange,
  provinceLabel,
  municipalityLabel,
  provincePlaceholder,
  municipalityPlaceholder,
  allowEmptyProvince = false,
  allowEmptyMunicipality = false,
  municipalityRequired = true,
  provinceRequired = true,
  className,
  gridClassName = "grid gap-3 sm:grid-cols-2",
  selectClassName = "kumbu-input font-normal",
}: AngolaProvinceMunicipalityFieldsProps) {
  const t = useTranslations("geo");
  const municipalities = municipalityOptionsForProvince(province, municipality);

  function handleProvinceChange(nextProvince: string) {
    onProvinceChange(nextProvince);
    const nextList = listAngolaMunicipalities(nextProvince);
    if (municipality && !nextList.includes(municipality)) {
      onMunicipalityChange("");
    }
  }

  return (
    <div className={cn(gridClassName, className)}>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {provinceLabel ?? t("province")}
        <select
          required={provinceRequired && !allowEmptyProvince}
          value={province}
          onChange={(e) => handleProvinceChange(e.target.value)}
          className={selectClassName}
        >
          {allowEmptyProvince && (
            <option value="">{provincePlaceholder ?? t("selectProvince")}</option>
          )}
          {listAngolaProvinces().map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {municipalityLabel ?? t("municipality")}
        <select
          required={municipalityRequired && !allowEmptyMunicipality}
          value={municipality}
          onChange={(e) => onMunicipalityChange(e.target.value)}
          className={selectClassName}
          disabled={!province}
        >
          {allowEmptyMunicipality && (
            <option value="">{municipalityPlaceholder ?? t("selectMunicipality")}</option>
          )}
          {!allowEmptyMunicipality && !municipality && (
            <option value="" disabled>
              {province
                ? (municipalityPlaceholder ?? t("selectMunicipality"))
                : t("selectProvinceFirst")}
            </option>
          )}
          {municipalities.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
