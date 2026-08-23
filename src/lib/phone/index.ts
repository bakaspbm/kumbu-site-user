import {
  DEFAULT_COUNTRY_ISO,
  getCountryByIso,
  parsePhoneParts,
} from "./country-calling-codes";

export {
  COUNTRY_CALLING_CODES,
  DEFAULT_COUNTRY_ISO,
  getCountryByIso,
  findCountryByDialCode,
  parsePhoneParts,
  type CountryCallingCode,
} from "./country-calling-codes";

/** Monta número E.164: +{indicativo}{nacional} */
export function buildPhoneE164(dialCode: string, nationalDigits: string): string {
  const code = dialCode.replace(/\D/g, "");
  const national = nationalDigits.replace(/\D/g, "");
  if (!code || !national) return "";
  return `+${code}${national}`;
}

/**
 * Formata dígitos nacionais para leitura (espaços).
 * Angola / PT: 923 456 789
 */
export function formatNationalDisplay(
  nationalDigits: string,
  countryIso: string = DEFAULT_COUNTRY_ISO,
): string {
  const d = nationalDigits.replace(/\D/g, "");
  const iso = countryIso.toUpperCase();
  if (iso === "AO" || iso === "PT") {
    const parts = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean);
    return parts.join(" ");
  }
  return d.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

/** Ex.: +244923456789 → "+244 923 456 789" */
export function formatPhoneE164Display(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return trimmed;

  if (digits.startsWith("244")) {
    return `+244 ${formatNationalDisplay(digits.slice(3), "AO")}`.trim();
  }

  const parts = parsePhoneParts(trimmed.startsWith("+") ? trimmed : `+${digits}`);
  if (!parts) {
    return trimmed.startsWith("+") ? `+${digits}` : digits;
  }
  const country = getCountryByIso(parts.iso);
  const national = formatNationalDisplay(parts.national, parts.iso);
  return `+${country.dialCode}${national ? ` ${national}` : ""}`;
}

/** Extraí só dígitos nacionais, limitados ao país. */
export function clampNationalDigits(
  raw: string,
  countryIso: string = DEFAULT_COUNTRY_ISO,
): string {
  const country = getCountryByIso(countryIso);
  return raw.replace(/\D/g, "").slice(0, country.nationalLength);
}

/**
 * Normaliza para E.164.
 * Sem «+»: assume Angola (+244) e no máximo 9 dígitos nacionais.
 */
export function normalizePhoneE164(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  const digits = s.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("244")) {
    const national = digits.slice(3, 12);
    return national ? `+244${national}` : "";
  }

  if (s.startsWith("+")) {
    const parts = parsePhoneParts(s);
    if (parts) {
      const country = getCountryByIso(parts.iso);
      const national = parts.national.slice(0, country.nationalLength);
      return national ? buildPhoneE164(country.dialCode, national) : "";
    }
    return digits.length >= 8 && digits.length <= 15 ? `+${digits.slice(0, 15)}` : "";
  }

  return `+244${digits.slice(0, 9)}`;
}

/** Valida comprimento E.164 (8–15 dígitos totais, norma ITU). */
export function isValidE164Phone(phone: string): boolean {
  if (!phone.startsWith("+")) return false;
  const digits = phone.slice(1).replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function isValidAngolaMobile(phoneOrNational: string): boolean {
  const digits = phoneOrNational.replace(/\D/g, "");
  const national = digits.startsWith("244") ? digits.slice(3) : digits;
  return /^9\d{8}$/.test(national);
}

export function buildPhoneFromCountry(
  countryIso: string,
  nationalDigits: string,
): string {
  const country = getCountryByIso(countryIso);
  return buildPhoneE164(country.dialCode, clampNationalDigits(nationalDigits, countryIso));
}

export function validateNationalForCountry(
  countryIso: string,
  nationalDigits: string,
): { ok: true; phone: string } | { ok: false; error: string } {
  const country = getCountryByIso(countryIso);
  const national = clampNationalDigits(nationalDigits, countryIso);

  if (country.iso === "AO") {
    if (national.length !== 9) {
      return { ok: false, error: "Indique 9 dígitos angolanos (ex.: 923 456 789)." };
    }
    if (!national.startsWith("9")) {
      return { ok: false, error: "Número móvel angolano deve começar por 9." };
    }
  } else if (national.length < country.nationalLength) {
    return {
      ok: false,
      error: `Indique ${country.nationalLength} dígitos para ${country.name}.`,
    };
  }

  const phone = buildPhoneE164(country.dialCode, national);
  if (!isValidE164Phone(phone)) {
    return { ok: false, error: "Indique um número válido." };
  }
  return { ok: true, phone };
}
