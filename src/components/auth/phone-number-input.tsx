"use client";

import { useMemo } from "react";
import {
  COUNTRY_CALLING_CODES,
  DEFAULT_COUNTRY_ISO,
  getCountryByIso,
  parsePhoneParts,
} from "@/lib/phone";

const STORAGE_KEY = "kumbu_phone_country_iso";

export function readStoredPhoneCountryIso(): string {
  if (typeof window === "undefined") return DEFAULT_COUNTRY_ISO;
  try {
    const iso = localStorage.getItem(STORAGE_KEY);
    if (iso && COUNTRY_CALLING_CODES.some((c) => c.iso === iso)) return iso;
  } catch {
    /* ignore */
  }
  return DEFAULT_COUNTRY_ISO;
}

export function storePhoneCountryIso(iso: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, iso);
  } catch {
    /* ignore */
  }
}

type PhoneNumberInputProps = {
  countryIso: string;
  onCountryIsoChange: (iso: string) => void;
  nationalNumber: string;
  onNationalNumberChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
};

export function PhoneNumberInput({
  countryIso,
  onCountryIsoChange,
  nationalNumber,
  onNationalNumberChange,
  disabled = false,
  id = "phone-national",
}: PhoneNumberInputProps) {
  const country = useMemo(() => getCountryByIso(countryIso), [countryIso]);

  function handleNationalChange(raw: string) {
    const parsed = parsePhoneParts(raw);
    if (parsed && raw.trim().startsWith("+")) {
      onCountryIsoChange(parsed.iso);
      storePhoneCountryIso(parsed.iso);
      onNationalNumberChange(parsed.national.replace(/\D/g, "").slice(0, 15));
      return;
    }
    const digits = raw.replace(/\D/g, "").slice(0, country.nationalLength + 2);
    onNationalNumberChange(digits);
  }

  function handleCountryChange(iso: string) {
    onCountryIsoChange(iso);
    storePhoneCountryIso(iso);
    const next = getCountryByIso(iso);
    onNationalNumberChange(
      nationalNumber.replace(/\D/g, "").slice(0, next.nationalLength + 2),
    );
  }

  return (
    <div className="flex overflow-hidden rounded-xl border border-kumbu-border bg-kumbu-surface focus-within:ring-2 focus-within:ring-kumbu-primary/30">
      <label className="sr-only" htmlFor={`${id}-country`}>
        Indicativo do país
      </label>
      <select
        id={`${id}-country`}
        value={countryIso}
        onChange={(e) => handleCountryChange(e.target.value)}
        disabled={disabled}
        className="max-w-[42%] shrink-0 cursor-pointer border-0 border-r border-kumbu-border bg-kumbu-secondary py-2.5 pl-2 pr-1 text-sm font-bold text-kumbu-foreground outline-none sm:max-w-[11rem]"
        aria-label="Indicativo internacional"
      >
        {COUNTRY_CALLING_CODES.map((c) => (
          <option key={c.iso} value={c.iso}>
            {c.flag} +{c.dialCode} {c.name}
          </option>
        ))}
      </select>
      <input
        id={id}
        type="tel"
        value={nationalNumber}
        onChange={(e) => handleNationalChange(e.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 font-normal outline-none"
        placeholder={country.iso === "AO" ? "923456789" : "912345678"}
        inputMode="tel"
        autoComplete="tel-national"
        disabled={disabled}
        aria-describedby={`${id}-hint`}
      />
    </div>
  );
}

export function phoneInputHint(countryIso: string): string {
  const c = getCountryByIso(countryIso);
  return `Indicativo +${c.dialCode} · ${c.name}. Pode colar o número completo com +.`;
}
