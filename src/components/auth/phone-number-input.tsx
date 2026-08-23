"use client";

import { useMemo } from "react";
import {
  COUNTRY_CALLING_CODES,
  DEFAULT_COUNTRY_ISO,
  clampNationalDigits,
  formatNationalDisplay,
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
  /** Só dígitos nacionais (sem espaços). */
  nationalNumber: string;
  onNationalNumberChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  required?: boolean;
};

export function PhoneNumberInput({
  countryIso,
  onCountryIsoChange,
  nationalNumber,
  onNationalNumberChange,
  disabled = false,
  id = "phone-national",
  required = false,
}: PhoneNumberInputProps) {
  const country = useMemo(() => getCountryByIso(countryIso), [countryIso]);
  const displayValue = formatNationalDisplay(nationalNumber, countryIso);

  function handleNationalChange(raw: string) {
    const trimmed = raw.trim();
    if (trimmed.startsWith("+") || (trimmed.replace(/\D/g, "").startsWith("244") && trimmed.replace(/\D/g, "").length > 9)) {
      const parsed = parsePhoneParts(trimmed.startsWith("+") ? trimmed : `+${trimmed.replace(/\D/g, "")}`);
      if (parsed) {
        onCountryIsoChange(parsed.iso);
        storePhoneCountryIso(parsed.iso);
        onNationalNumberChange(clampNationalDigits(parsed.national, parsed.iso));
        return;
      }
    }
    onNationalNumberChange(clampNationalDigits(raw, countryIso));
  }

  function handleCountryChange(iso: string) {
    onCountryIsoChange(iso);
    storePhoneCountryIso(iso);
    onNationalNumberChange(clampNationalDigits(nationalNumber, iso));
  }

  const maxDisplayLen =
    country.iso === "AO" || country.iso === "PT"
      ? country.nationalLength + 2 // "923 456 789"
      : country.nationalLength + Math.floor((country.nationalLength - 1) / 3);

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
        value={displayValue}
        onChange={(e) => handleNationalChange(e.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 font-normal tracking-wide outline-none"
        placeholder={country.iso === "AO" ? "923 456 789" : "Número local"}
        inputMode="numeric"
        autoComplete="tel-national"
        disabled={disabled}
        required={required}
        maxLength={maxDisplayLen}
        aria-describedby={`${id}-hint`}
      />
    </div>
  );
}

export function phoneInputHint(countryIso: string): string {
  const c = getCountryByIso(countryIso);
  if (c.iso === "AO") {
    return `Angola +244 · 9 dígitos (ex.: 923 456 789). Pode colar +244…`;
  }
  return `Indicativo +${c.dialCode} · ${c.name} · ${c.nationalLength} dígitos. Pode colar o número com +.`;
}
