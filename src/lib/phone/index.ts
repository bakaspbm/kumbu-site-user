import {
  DEFAULT_COUNTRY_ISO,
  getCountryByIso,
  type CountryCallingCode,
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

/** Normaliza para E.164 quando o utilizador cola número completo. */
export function normalizePhoneE164(raw: string): string {
  const s = raw.trim().replace(/\s/g, "");
  if (!s) return "";
  if (s.startsWith("+")) {
    const digits = s.slice(1).replace(/\D/g, "");
    return digits ? `+${digits}` : "";
  }
  const digits = s.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("244") && digits.length >= 12) return `+${digits}`;
  if (digits.length >= 9 && digits.length <= 15) return `+${digits}`;
  return `+${digits}`;
}

/** Valida comprimento E.164 (8–15 dígitos totais, norma ITU). */
export function isValidE164Phone(phone: string): boolean {
  if (!phone.startsWith("+")) return false;
  const digits = phone.slice(1).replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function buildPhoneFromCountry(
  countryIso: string,
  nationalDigits: string,
): string {
  const country = getCountryByIso(countryIso);
  return buildPhoneE164(country.dialCode, nationalDigits);
}

export function validateNationalForCountry(
  countryIso: string,
  nationalDigits: string,
): { ok: true; phone: string } | { ok: false; error: string } {
  const country = getCountryByIso(countryIso);
  const national = nationalDigits.replace(/\D/g, "");
  if (national.length < 4) {
    return { ok: false, error: "Número demasiado curto." };
  }
  if (national.length > country.nationalLength + 2) {
    return { ok: false, error: "Número demasiado longo para este país." };
  }
  const phone = buildPhoneE164(country.dialCode, national);
  if (!isValidE164Phone(phone)) {
    return { ok: false, error: "Indique um número válido." };
  }
  return { ok: true, phone };
}
