"use client";

import { AngolaProvinceMunicipalityFields } from "@/components/geo/angola-province-municipality-fields";
import { useTranslations } from "next-intl";
import { isLandPropertyType } from "@/lib/property/constants";
import { usePropertyPublishLabels } from "@/lib/i18n/use-property-labels";
import type {
  PropertyListingIntent,
  PropertyMeta,
  PropertyRentPeriod,
  PropertyType,
} from "@/types/property";

export interface PropertyPublishState {
  propertyType: PropertyType;
  listingIntent: PropertyListingIntent;
  rentPeriod: PropertyRentPeriod | "";
  province: string;
  municipality: string;
  bairro: string;
  priceAmount: string;
  title: string;
  description: string;
  bedrooms: string;
  bathrooms: string;
  areaSqm: string;
  builtAreaSqm: string;
  floor: string;
  parking: boolean;
  furnished: boolean;
  hasTitleDeed: boolean;
  hasUtilities: boolean;
  walledCompound: boolean;
  generator: boolean;
  condoFeeKz: string;
  roomsCount: string;
  sharedBathroom: boolean;
  sharedKitchen: boolean;
  mealsIncluded: boolean;
  hotelStars: string;
  reception24h: boolean;
  breakfastIncluded: boolean;
  zoning: PropertyMeta["zoning"] | "";
  constructionStage: PropertyMeta["constructionStage"] | "";
  minNights: string;
  depositMonths: string;
}

export const defaultPropertyPublishState = (): PropertyPublishState => ({
  propertyType: "casa",
  listingIntent: "sale",
  rentPeriod: "",
  province: "Luanda",
  municipality: "",
  bairro: "",
  priceAmount: "",
  title: "",
  description: "",
  bedrooms: "",
  bathrooms: "",
  areaSqm: "",
  builtAreaSqm: "",
  floor: "",
  parking: false,
  furnished: false,
  hasTitleDeed: false,
  hasUtilities: false,
  walledCompound: false,
  generator: false,
  condoFeeKz: "",
  roomsCount: "",
  sharedBathroom: false,
  sharedKitchen: false,
  mealsIncluded: false,
  hotelStars: "",
  reception24h: false,
  breakfastIncluded: false,
  zoning: "",
  constructionStage: "",
  minNights: "1",
  depositMonths: "",
});

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-kumbu-border text-kumbu-primary"
      />
      {label}
    </label>
  );
}

interface PropertyPublishSectionProps {
  state: PropertyPublishState;
  onChange: (patch: Partial<PropertyPublishState>) => void;
}

export function PropertyPublishSection({ state, onChange }: PropertyPublishSectionProps) {
  const tp = useTranslations("property.publish");
  const {
    tTypes,
    propertyTypes,
    titlePlaceholder,
    descriptionPlaceholder,
    pricePlaceholder,
    constructionStageLabel,
    zoningLabel,
  } = usePropertyPublishLabels();
  const isRent = state.listingIntent === "rent";
  const isDaily = isRent && state.rentPeriod === "daily";
  const isLong = isRent && state.rentPeriod === "long_term";
  const pt = state.propertyType;
  const landSaleOnly = isLandPropertyType(pt);

  const priceLabel = landSaleOnly || !isRent
    ? tp("priceSale")
    : isDaily
      ? tp("priceNightly")
      : tp("priceMonthly");

  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {tp("propertyType")}
        <select
          value={state.propertyType}
          onChange={(e) => {
            const propertyType = e.target.value as PropertyType;
            if (isLandPropertyType(propertyType)) {
              onChange({
                propertyType,
                listingIntent: "sale",
                rentPeriod: "",
              });
            } else {
              onChange({ propertyType });
            }
          }}
          className="kumbu-input font-normal"
        >
          {propertyTypes.map((id) => (
            <option key={id} value={id}>
              {tTypes(id)}
            </option>
          ))}
        </select>
      </label>

      {landSaleOnly ? (
        <p className="rounded-xl bg-kumbu-secondary px-3 py-2 text-sm text-kumbu-muted">
          {tp.rich("landSaleOnly", {
            strong: (chunks) => <strong className="text-kumbu-foreground">{chunks}</strong>,
          })}
        </p>
      ) : (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">{tp("purpose")}</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["sale", tp("sell")],
                ["rent", tp("rent")],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  onChange({
                    listingIntent: id,
                    rentPeriod: id === "rent" ? state.rentPeriod || "long_term" : "",
                  })
                }
                className={`rounded-full px-4 py-2 text-xs font-bold ${
                  state.listingIntent === id
                    ? "bg-kumbu-primary text-white"
                    : "bg-kumbu-secondary text-kumbu-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {isRent && !landSaleOnly && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">{tp("rentType")}</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["daily", tp("rentDaily")],
                ["long_term", tp("rentLongTerm")],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => onChange({ rentPeriod: id })}
                className={`rounded-full px-4 py-2 text-xs font-bold ${
                  state.rentPeriod === id
                    ? "bg-kumbu-primary text-white"
                    : "bg-kumbu-secondary text-kumbu-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {isDaily && (
            <p className="text-xs text-kumbu-muted">{tp("rentDailyHint")}</p>
          )}
        </fieldset>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {tp("listingTitle")}
        <input
          required
          value={state.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="kumbu-input font-normal"
          placeholder={titlePlaceholder(pt)}
          maxLength={120}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {priceLabel}
        <input
          required
          inputMode="numeric"
          value={state.priceAmount}
          onChange={(e) => onChange({ priceAmount: e.target.value.replace(/\D/g, "") })}
          className="kumbu-input font-normal"
          placeholder={pricePlaceholder(pt, state.listingIntent, state.rentPeriod)}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <AngolaProvinceMunicipalityFields
            province={state.province}
            municipality={state.municipality}
            onProvinceChange={(province) => onChange({ province })}
            onMunicipalityChange={(municipality) => onChange({ municipality })}
            gridClassName="grid gap-3 sm:grid-cols-2"
          />
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          {tp("neighborhood")}
          <input
            value={state.bairro}
            onChange={(e) => onChange({ bairro: e.target.value })}
            className="kumbu-input font-normal"
            placeholder={tp("neighborhoodPlaceholder")}
          />
        </label>
      </div>

      {(pt === "casa" || pt === "apartamento" || pt === "quarto") && (
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {tp("bedrooms")}
            <input
              type="number"
              min={0}
              value={state.bedrooms}
              onChange={(e) => onChange({ bedrooms: e.target.value })}
              className="kumbu-input font-normal"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {tp("bathrooms")}
            <input
              type="number"
              min={0}
              value={state.bathrooms}
              onChange={(e) => onChange({ bathrooms: e.target.value })}
              className="kumbu-input font-normal"
            />
          </label>
        </div>
      )}

      {(pt === "casa" ||
        pt === "apartamento" ||
        pt === "terreno_vazio" ||
        pt === "terreno_inacabado") && (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          {tp("area")}
          <input
            type="number"
            min={0}
            value={state.areaSqm}
            onChange={(e) => onChange({ areaSqm: e.target.value })}
            className="kumbu-input font-normal"
          />
        </label>
      )}

      {pt === "apartamento" && (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          {tp("floor")}
          <input
            type="number"
            value={state.floor}
            onChange={(e) => onChange({ floor: e.target.value })}
            className="kumbu-input font-normal"
          />
        </label>
      )}

      {pt === "terreno_inacabado" && (
        <>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {tp("builtArea")}
            <input
              type="number"
              value={state.builtAreaSqm}
              onChange={(e) => onChange({ builtAreaSqm: e.target.value })}
              className="kumbu-input font-normal"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {tp("constructionStageLabel")}
            <select
              value={state.constructionStage ?? ""}
              onChange={(e) =>
                onChange({
                  constructionStage: e.target.value as PropertyMeta["constructionStage"],
                })
              }
              className="kumbu-input font-normal"
            >
              <option value="">{tp("dash")}</option>
              {(["fundacoes", "estrutura", "acabamentos", "parcial"] as const).map((stage) => (
                <option key={stage} value={stage}>
                  {constructionStageLabel(stage)}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      {(pt === "hospedaria" || pt === "hotel" || pt === "quarto") && (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          {tp("roomsCount")}
          <input
            type="number"
            min={1}
            value={state.roomsCount}
            onChange={(e) => onChange({ roomsCount: e.target.value })}
            className="kumbu-input font-normal"
          />
        </label>
      )}

      {pt === "hotel" && (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          {tp("hotelStars")}
          <select
            value={state.hotelStars}
            onChange={(e) => onChange({ hotelStars: e.target.value })}
            className="kumbu-input font-normal"
          >
            <option value="">{tp("dash")}</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={String(n)}>
                {tp("starCount", { count: n })}
              </option>
            ))}
          </select>
        </label>
      )}

      {pt === "terreno_vazio" && (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          {tp("zoningLabel")}
          <select
            value={state.zoning ?? ""}
            onChange={(e) => onChange({ zoning: e.target.value as PropertyMeta["zoning"] })}
            className="kumbu-input font-normal"
          >
            <option value="">{tp("dash")}</option>
            {(["residencial", "comercial", "agricola", "misto"] as const).map((zone) => (
              <option key={zone} value={zone}>
                {zoningLabel(zone)}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {(pt === "casa" || pt === "apartamento") && (
          <>
            <Checkbox label={tp("parking")} checked={state.parking} onChange={(v) => onChange({ parking: v })} />
            <Checkbox label={tp("furnished")} checked={state.furnished} onChange={(v) => onChange({ furnished: v })} />
            <Checkbox label={tp("hasTitleDeed")} checked={state.hasTitleDeed} onChange={(v) => onChange({ hasTitleDeed: v })} />
          </>
        )}
        {pt === "casa" && (
          <>
            <Checkbox label={tp("walledCompound")} checked={state.walledCompound} onChange={(v) => onChange({ walledCompound: v })} />
            <Checkbox label={tp("generator")} checked={state.generator} onChange={(v) => onChange({ generator: v })} />
          </>
        )}
        {pt === "apartamento" && (
          <label className="flex flex-col gap-1 text-sm font-semibold">
            {tp("condoFee")}
            <input
              value={state.condoFeeKz}
              onChange={(e) => onChange({ condoFeeKz: e.target.value.replace(/\D/g, "") })}
              className="kumbu-input font-normal"
            />
          </label>
        )}
        {(pt === "terreno_vazio" || pt === "terreno_inacabado") && (
          <>
            <Checkbox label={tp("hasTitleDeed")} checked={state.hasTitleDeed} onChange={(v) => onChange({ hasTitleDeed: v })} />
            <Checkbox label={tp("hasUtilities")} checked={state.hasUtilities} onChange={(v) => onChange({ hasUtilities: v })} />
          </>
        )}
        {(pt === "hospedaria" || pt === "quarto") && (
          <>
            <Checkbox label={tp("sharedBathroom")} checked={state.sharedBathroom} onChange={(v) => onChange({ sharedBathroom: v })} />
            {pt === "quarto" && (
              <Checkbox label={tp("sharedKitchen")} checked={state.sharedKitchen} onChange={(v) => onChange({ sharedKitchen: v })} />
            )}
            {pt === "hospedaria" && (
              <Checkbox label={tp("mealsIncluded")} checked={state.mealsIncluded} onChange={(v) => onChange({ mealsIncluded: v })} />
            )}
          </>
        )}
        {pt === "hotel" && (
          <>
            <Checkbox label={tp("reception24h")} checked={state.reception24h} onChange={(v) => onChange({ reception24h: v })} />
            <Checkbox label={tp("breakfastIncluded")} checked={state.breakfastIncluded} onChange={(v) => onChange({ breakfastIncluded: v })} />
          </>
        )}
      </div>

      {isDaily && (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          {tp("minNights")}
          <input
            type="number"
            min={1}
            value={state.minNights}
            onChange={(e) => onChange({ minNights: e.target.value })}
            className="kumbu-input font-normal"
          />
        </label>
      )}

      {isLong && (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          {tp("depositMonths")}
          <input
            type="number"
            min={0}
            value={state.depositMonths}
            onChange={(e) => onChange({ depositMonths: e.target.value })}
            className="kumbu-input font-normal"
            placeholder={tp("depositPlaceholder")}
          />
        </label>
      )}

      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        {tp("description")}
        <textarea
          value={state.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="kumbu-input min-h-[100px] font-normal"
          rows={4}
          placeholder={descriptionPlaceholder(pt)}
        />
      </label>
    </div>
  );
}

export function buildPropertyMetaFromState(
  state: PropertyPublishState,
): PropertyMeta {
  const num = (s: string) => (s.trim() ? Number(s) : null);
  const land = isLandPropertyType(state.propertyType);
  const intent = land ? "sale" : state.listingIntent;
  return {
    propertyType: state.propertyType,
    listingIntent: intent,
    rentPeriod:
      !land && intent === "rent"
        ? (state.rentPeriod as PropertyRentPeriod) || "long_term"
        : null,
    province: state.province || null,
    municipality: state.municipality || null,
    bairro: state.bairro || null,
    priceAmount: num(state.priceAmount),
    bedrooms: num(state.bedrooms),
    bathrooms: num(state.bathrooms),
    areaSqm: num(state.areaSqm),
    builtAreaSqm: num(state.builtAreaSqm),
    floor: num(state.floor),
    parking: state.parking,
    furnished: state.furnished,
    hasTitleDeed: state.hasTitleDeed,
    hasUtilities: state.hasUtilities,
    walledCompound: state.walledCompound,
    generator: state.generator,
    condoFeeKz: num(state.condoFeeKz),
    roomsCount: num(state.roomsCount),
    sharedBathroom: state.sharedBathroom,
    sharedKitchen: state.sharedKitchen,
    mealsIncluded: state.mealsIncluded,
    hotelStars: num(state.hotelStars),
    reception24h: state.reception24h,
    breakfastIncluded: state.breakfastIncluded,
    zoning: state.zoning || null,
    constructionStage: state.constructionStage || null,
    minNights: num(state.minNights) ?? 1,
    depositMonths: num(state.depositMonths),
  };
}

export function validatePropertyPublishState(state: PropertyPublishState): string | null {
  if (!state.title.trim()) return "Indique o título.";
  if (!state.priceAmount.trim()) return "Indique o preço.";
  if (!state.municipality.trim()) return "Indique o município.";
  if (
    !isLandPropertyType(state.propertyType) &&
    state.listingIntent === "rent" &&
    !state.rentPeriod
  ) {
    return "Escolha aluguer diário ou longo prazo.";
  }
  return null;
}

export function formatPriceLabelFromState(state: PropertyPublishState): string {
  const n = Number(state.priceAmount);
  const fmt = new Intl.NumberFormat("pt-AO").format(n);
  if (isLandPropertyType(state.propertyType) || state.listingIntent === "sale") {
    return `${fmt} Kz`;
  }
  if (state.rentPeriod === "daily") return `${fmt} Kz/noite`;
  return `${fmt} Kz/mês`;
}
