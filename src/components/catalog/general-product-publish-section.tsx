"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AngolaProvinceMunicipalityFields } from "@/components/geo/angola-province-municipality-fields";
import { VehicleBrandModelFields } from "@/components/catalog/vehicle-brand-model-fields";
import {
  localizeDescriptionPlaceholder,
  localizePricePlaceholder,
  localizeProductFields,
  localizeTitlePlaceholder,
} from "@/lib/catalog/localize-product-fields";
import { getProductFields, validateProductAttributes } from "@/lib/catalog/product-fields";
import { resolveVehicleCatalogKind } from "@/lib/catalog/vehicles";
import { formatPriceLabel } from "@/lib/utils";
import type { GeneralProductPublishState } from "@/types/product";

interface Props {
  categoryId: string;
  subcategoryId: string;
  subcategoryName?: string;
  state: GeneralProductPublishState;
  onChange: (patch: Partial<GeneralProductPublishState>) => void;
}

export function validateGeneralProductPublish(
  categoryId: string,
  subcategoryId: string | null | undefined,
  state: GeneralProductPublishState,
  requireSubcategory: boolean,
  t?: (key: string) => string,
): string | null {
  const msg = (key: string, fallback: string) =>
    t ? t(`validation.${key}`) : fallback;
  if (requireSubcategory && !subcategoryId) {
    return msg("subcategoryRequired", "Seleccione o tipo de produto (subcategoria).");
  }
  if (!state.title.trim()) return msg("titleRequired", "Indique o título do anúncio.");
  if (!state.priceLabel.trim()) return msg("priceRequired", "Indique o preço.");
  if (!state.municipality.trim()) return msg("municipalityRequired", "Seleccione o município.");
  if (!state.province.trim()) return msg("provinceRequired", "Seleccione a província.");
  return validateProductAttributes(categoryId, subcategoryId, state.attributes);
}

export function GeneralProductPublishSection({
  categoryId,
  subcategoryId,
  subcategoryName,
  state,
  onChange,
}: Props) {
  const t = useTranslations("catalogFields");
  const fields = useMemo(
    () => localizeProductFields(getProductFields(categoryId, subcategoryId || null), t),
    [categoryId, subcategoryId, t],
  );
  const vehicleKind = useMemo(
    () => resolveVehicleCatalogKind(categoryId, subcategoryId || null),
    [categoryId, subcategoryId],
  );

  const brandField = fields.find((f) => f.key === "brand");
  const modelField = fields.find((f) => f.key === "model");
  const otherFields = vehicleKind
    ? fields.filter((f) => f.key !== "brand" && f.key !== "model")
    : fields;

  function setAttr(key: string, value: string) {
    onChange({
      attributes: { ...state.attributes, [key]: value },
    });
  }

  return (
    <div className="space-y-4">
      {subcategoryName && (
        <p className="rounded-xl bg-kumbu-secondary px-3 py-2 text-sm font-semibold text-kumbu-foreground">
          {t("form.typePrefix")} {subcategoryName}
        </p>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {t("form.title")}
        <input
          required
          value={state.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="kumbu-input font-normal"
          maxLength={120}
          placeholder={localizeTitlePlaceholder(categoryId, subcategoryId || null, t)}
        />
      </label>

      {vehicleKind && brandField && modelField ? (
        <VehicleBrandModelFields
          kind={vehicleKind}
          brand={state.attributes.brand ?? ""}
          model={state.attributes.model ?? ""}
          brandLabel={brandField.label}
          modelLabel={modelField.label}
          brandPlaceholder={brandField.placeholder}
          modelPlaceholder={modelField.placeholder}
          brandRequired={brandField.required}
          modelRequired={modelField.required}
          onBrandChange={(brand) => setAttr("brand", brand)}
          onModelChange={(model) => setAttr("model", model)}
        />
      ) : null}

      {otherFields.map((f) => {
        const fieldId = `pub-${categoryId}-${subcategoryId || "x"}-${f.key}`;
        const listId =
          f.suggestions && f.suggestions.length > 0 ? `${fieldId}-list` : undefined;
        return (
          <label
            key={`${categoryId}:${subcategoryId}:${f.key}`}
            htmlFor={fieldId}
            className="flex flex-col gap-1.5 text-sm font-semibold"
          >
            {f.label}
            {f.required ? " *" : ""}
            {f.type === "select" ? (
              <select
                id={fieldId}
                name={fieldId}
                value={state.attributes[f.key] ?? ""}
                onChange={(e) => setAttr(f.key, e.target.value)}
                className="kumbu-input font-normal"
                required={f.required}
                autoComplete="off"
              >
                <option value="">{t("form.select")}</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <>
                <input
                  id={fieldId}
                  name={fieldId}
                  type={f.type === "number" ? "number" : "text"}
                  value={state.attributes[f.key] ?? ""}
                  onChange={(e) => setAttr(f.key, e.target.value)}
                  className="kumbu-input font-normal"
                  placeholder={f.placeholder}
                  required={f.required}
                  list={listId}
                  autoComplete="off"
                />
                {listId && f.suggestions ? (
                  <datalist id={listId}>
                    {f.suggestions.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                ) : null}
              </>
            )}
          </label>
        );
      })}

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {t("form.price")}
        <input
          required
          inputMode="decimal"
          value={state.priceLabel}
          onChange={(e) => onChange({ priceLabel: e.target.value })}
          onBlur={() => {
            const v = state.priceLabel.trim();
            if (!v) return;
            const formatted = formatPriceLabel(v);
            if (formatted !== "—" && formatted !== state.priceLabel) {
              onChange({ priceLabel: formatted });
            }
          }}
          className="kumbu-input font-normal"
          placeholder={localizePricePlaceholder(categoryId, subcategoryId || null, t)}
        />
      </label>
      <AngolaProvinceMunicipalityFields
        province={state.province}
        municipality={state.municipality}
        onProvinceChange={(province) => onChange({ province })}
        onMunicipalityChange={(municipality) => onChange({ municipality })}
      />
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {t("form.description")}
        <textarea
          value={state.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="kumbu-input min-h-[88px] font-normal"
          rows={3}
          placeholder={localizeDescriptionPlaceholder(categoryId, subcategoryId || null, t)}
        />
      </label>
    </div>
  );
}
