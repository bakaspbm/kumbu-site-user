"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { VehicleCatalogKind } from "@/lib/catalog/vehicles";

type CatalogApi = {
  getVehicleBrands: (kind: VehicleCatalogKind) => readonly string[];
  getVehicleModelsForBrand: (kind: VehicleCatalogKind, brand: string) => readonly string[];
};

interface Props {
  kind: VehicleCatalogKind;
  brand: string;
  model: string;
  brandLabel: string;
  modelLabel: string;
  brandPlaceholder?: string;
  modelPlaceholder?: string;
  brandRequired?: boolean;
  modelRequired?: boolean;
  onBrandChange: (brand: string) => void;
  onModelChange: (model: string) => void;
}

export function VehicleBrandModelFields({
  kind,
  brand,
  model,
  brandLabel,
  modelLabel,
  brandPlaceholder,
  modelPlaceholder,
  brandRequired = true,
  modelRequired = true,
  onBrandChange,
  onModelChange,
}: Props) {
  const t = useTranslations("catalogFields.vehicles");
  const [api, setApi] = useState<CatalogApi | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("@/lib/catalog/vehicles").then((mod) => {
      if (cancelled) return;
      setApi({
        getVehicleBrands: mod.getVehicleBrands,
        getVehicleModelsForBrand: mod.getVehicleModelsForBrand,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const brands = useMemo(() => (api ? api.getVehicleBrands(kind) : []), [api, kind]);
  const models = useMemo(
    () => (api && brand.trim() ? api.getVehicleModelsForBrand(kind, brand) : []),
    [api, kind, brand],
  );

  const brandListId = `kumbu-vdb-brands-${kind}`;
  const modelListId = `kumbu-vdb-models-${kind}`;

  function handleBrandChange(next: string) {
    onBrandChange(next);
    if (!api) return;
    const nextModels = api.getVehicleModelsForBrand(kind, next);
    if (model && nextModels.length > 0) {
      const ok = nextModels.some((m) => m.toLowerCase() === model.trim().toLowerCase());
      if (!ok) onModelChange("");
    }
  }

  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {brandLabel}
        {brandRequired ? " *" : ""}
        <input
          type="text"
          value={brand}
          onChange={(e) => handleBrandChange(e.target.value)}
          className="kumbu-input font-normal"
          placeholder={brandPlaceholder}
          required={brandRequired}
          list={brands.length > 0 ? brandListId : undefined}
          autoComplete="off"
        />
        {brands.length > 0 ? (
          <datalist id={brandListId}>
            {brands.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        ) : null}
        <span className="text-xs font-normal text-kumbu-muted">{t("brandHint")}</span>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {modelLabel}
        {modelRequired ? " *" : ""}
        <input
          type="text"
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="kumbu-input font-normal"
          placeholder={modelPlaceholder}
          required={modelRequired}
          list={models.length > 0 ? modelListId : undefined}
          autoComplete="off"
        />
        {models.length > 0 ? (
          <datalist id={modelListId}>
            {models.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        ) : null}
        <span className="text-xs font-normal text-kumbu-muted">
          {models.length > 0 ? t("modelHintWithBrand") : t("modelHint")}
        </span>
      </label>
    </div>
  );
}
