"use client";

import { useTranslations } from "next-intl";
import { AngolaProvinceMunicipalityFields } from "@/components/geo/angola-province-municipality-fields";
import { getConditionFilterOptions } from "@/lib/catalog/product-fields";
import { isJobCategory } from "@/lib/jobs/category";
import { isPropertyCategory } from "@/lib/property/category";
import type { CatalogCategory, SortMode } from "@/types/store";
import type { PropertyListingIntent, PropertyType } from "@/types/property";

export type CatalogFilterState = {
  region: string;
  city: string;
  priceMin: string;
  priceMax: string;
  sortMode: SortMode;
  listingIntent: PropertyListingIntent | "";
  propertyType: PropertyType | "";
  condition: string;
};

export const EMPTY_CATALOG_FILTERS: CatalogFilterState = {
  region: "",
  city: "",
  priceMin: "",
  priceMax: "",
  sortMode: "default",
  listingIntent: "",
  propertyType: "",
  condition: "",
};

const PROPERTY_TYPES: PropertyType[] = [
  "casa",
  "apartamento",
  "hospedaria",
  "quarto",
  "hotel",
  "terreno_vazio",
  "terreno_inacabado",
];

const SORT_OPTIONS: { value: SortMode; labelKey: string }[] = [
  { value: "default", labelKey: "sortDefault" },
  { value: "newest", labelKey: "sortNewest" },
  { value: "price_asc", labelKey: "sortPriceAsc" },
  { value: "price_desc", labelKey: "sortPriceDesc" },
  { value: "rating_desc", labelKey: "sortRating" },
];

type CatalogFiltersPanelProps = {
  value: CatalogFilterState;
  onChange: (patch: Partial<CatalogFilterState>) => void;
  onClear?: () => void;
  category?: CatalogCategory | null;
  compact?: boolean;
};

export function CatalogFiltersPanel({
  value,
  onChange,
  onClear,
  category,
  compact = false,
}: CatalogFiltersPanelProps) {
  const t = useTranslations("search");
  const tFields = useTranslations("catalogFields");
  const isJobs =
    category != null &&
    (isJobCategory(category) ||
      category.kind === "job" ||
      category.id === "empregos" ||
      category.id === "emprego");
  const showProperty =
    category != null &&
    !isJobs &&
    (isPropertyCategory(category) || category.id === "imoveis" || category.kind === "property");
  const showCondition =
    category != null && !showProperty && !isJobs;
  const conditionOptions = getConditionFilterOptions(category?.id);
  const conditionValue = conditionOptions.some((o) => o.value === value.condition)
    ? value.condition
    : "";
  const showPrice = !isJobs;
  const sortOptions = showPrice
    ? SORT_OPTIONS
    : SORT_OPTIONS.filter((opt) => opt.value !== "price_asc" && opt.value !== "price_desc");

  return (
    <div className={`kumbu-card space-y-3 ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-kumbu-foreground">{t("filters")}</h2>
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-kumbu-primary hover:underline"
          >
            {t("clearFilters")}
          </button>
        ) : null}
      </div>

      <AngolaProvinceMunicipalityFields
        province={value.region}
        municipality={value.city}
        onProvinceChange={(region) => onChange({ region, city: "" })}
        onMunicipalityChange={(city) => onChange({ city })}
        allowEmptyProvince
        allowEmptyMunicipality
        provinceRequired={false}
        municipalityRequired={false}
        provincePlaceholder={t("allProvinces")}
        municipalityPlaceholder={t("allMunicipalities")}
        gridClassName="grid grid-cols-1 gap-2 sm:grid-cols-2"
        selectClassName="kumbu-input text-sm"
      />

      {showPrice ? (
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1">
            <span className="text-[11px] font-semibold text-kumbu-muted">{t("priceMin")}</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={value.priceMin}
              onChange={(e) => onChange({ priceMin: e.target.value })}
              placeholder="0"
              className="kumbu-input text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-semibold text-kumbu-muted">{t("priceMax")}</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={value.priceMax}
              onChange={(e) => onChange({ priceMax: e.target.value })}
              placeholder={t("anyPrice")}
              className="kumbu-input text-sm"
            />
          </label>
        </div>
      ) : null}

      <label className="block space-y-1">
        <span className="text-[11px] font-semibold text-kumbu-muted">{t("sortLabel")}</span>
        <select
          value={
            !showPrice && (value.sortMode === "price_asc" || value.sortMode === "price_desc")
              ? "default"
              : value.sortMode
          }
          onChange={(e) => onChange({ sortMode: e.target.value as SortMode })}
          className="kumbu-input text-sm"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </label>

      {showCondition ? (
        <label className="block space-y-1">
          <span className="text-[11px] font-semibold text-kumbu-muted">
            {tFields("condition.label")}
          </span>
          <select
            value={conditionValue}
            onChange={(e) => onChange({ condition: e.target.value })}
            className="kumbu-input text-sm"
          >
            <option value="">{t("anyCondition")}</option>
            {conditionOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {tFields(`condition.options.${c.value}`)}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {showProperty ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-[11px] font-semibold text-kumbu-muted">{t("listingIntent")}</span>
            <select
              value={value.listingIntent}
              onChange={(e) =>
                onChange({ listingIntent: e.target.value as PropertyListingIntent | "" })
              }
              className="kumbu-input text-sm"
            >
              <option value="">{t("anyIntent")}</option>
              <option value="rent">{t("intentRent")}</option>
              <option value="sale">{t("intentSale")}</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-semibold text-kumbu-muted">{t("propertyType")}</span>
            <select
              value={value.propertyType}
              onChange={(e) =>
                onChange({ propertyType: e.target.value as PropertyType | "" })
              }
              className="kumbu-input text-sm"
            >
              <option value="">{t("anyPropertyType")}</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`propertyType_${type}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </div>
  );
}

export function parsePriceFilter(raw: string): number | undefined {
  const n = Number(raw.replace(/\s/g, ""));
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.floor(n);
}
