export type CountryCallingCode = {
  iso: string;
  name: string;
  dialCode: string;
  flag: string;
  /** Comprimento típico do número nacional (sem indicativo), para limitar input */
  nationalLength: number;
};

/** Indicativos internacionais (ordenados por nome; Angola primeiro). */
export const COUNTRY_CALLING_CODES: CountryCallingCode[] = [
  { iso: "AO", name: "Angola", dialCode: "244", flag: "🇦🇴", nationalLength: 9 },
  { iso: "PT", name: "Portugal", dialCode: "351", flag: "🇵🇹", nationalLength: 9 },
  { iso: "BR", name: "Brasil", dialCode: "55", flag: "🇧🇷", nationalLength: 11 },
  { iso: "MZ", name: "Moçambique", dialCode: "258", flag: "🇲🇿", nationalLength: 9 },
  { iso: "CV", name: "Cabo Verde", dialCode: "238", flag: "🇨🇻", nationalLength: 7 },
  { iso: "ST", name: "São Tomé e Príncipe", dialCode: "239", flag: "🇸🇹", nationalLength: 7 },
  { iso: "GW", name: "Guiné-Bissau", dialCode: "245", flag: "🇬🇼", nationalLength: 9 },
  { iso: "GQ", name: "Guiné Equatorial", dialCode: "240", flag: "🇬🇶", nationalLength: 9 },
  { iso: "CD", name: "RD Congo", dialCode: "243", flag: "🇨🇩", nationalLength: 9 },
  { iso: "CG", name: "Congo", dialCode: "242", flag: "🇨🇬", nationalLength: 9 },
  { iso: "NA", name: "Namíbia", dialCode: "264", flag: "🇳🇦", nationalLength: 9 },
  { iso: "ZA", name: "África do Sul", dialCode: "27", flag: "🇿🇦", nationalLength: 9 },
  { iso: "ZW", name: "Zimbabué", dialCode: "263", flag: "🇿🇼", nationalLength: 9 },
  { iso: "ZM", name: "Zâmbia", dialCode: "260", flag: "🇿🇲", nationalLength: 9 },
  { iso: "KE", name: "Quénia", dialCode: "254", flag: "🇰🇪", nationalLength: 9 },
  { iso: "NG", name: "Nigéria", dialCode: "234", flag: "🇳🇬", nationalLength: 10 },
  { iso: "GH", name: "Gana", dialCode: "233", flag: "🇬🇭", nationalLength: 9 },
  { iso: "SN", name: "Senegal", dialCode: "221", flag: "🇸🇳", nationalLength: 9 },
  { iso: "CI", name: "Costa do Marfim", dialCode: "225", flag: "🇨🇮", nationalLength: 10 },
  { iso: "CM", name: "Camarões", dialCode: "237", flag: "🇨🇲", nationalLength: 9 },
  { iso: "FR", name: "França", dialCode: "33", flag: "🇫🇷", nationalLength: 9 },
  { iso: "ES", name: "Espanha", dialCode: "34", flag: "🇪🇸", nationalLength: 9 },
  { iso: "DE", name: "Alemanha", dialCode: "49", flag: "🇩🇪", nationalLength: 11 },
  { iso: "IT", name: "Itália", dialCode: "39", flag: "🇮🇹", nationalLength: 10 },
  { iso: "GB", name: "Reino Unido", dialCode: "44", flag: "🇬🇧", nationalLength: 10 },
  { iso: "NL", name: "Países Baixos", dialCode: "31", flag: "🇳🇱", nationalLength: 9 },
  { iso: "BE", name: "Bélgica", dialCode: "32", flag: "🇧🇪", nationalLength: 9 },
  { iso: "CH", name: "Suíça", dialCode: "41", flag: "🇨🇭", nationalLength: 9 },
  { iso: "US", name: "Estados Unidos", dialCode: "1", flag: "🇺🇸", nationalLength: 10 },
  { iso: "CA", name: "Canadá", dialCode: "1", flag: "🇨🇦", nationalLength: 10 },
  { iso: "MX", name: "México", dialCode: "52", flag: "🇲🇽", nationalLength: 10 },
  { iso: "AR", name: "Argentina", dialCode: "54", flag: "🇦🇷", nationalLength: 10 },
  { iso: "CO", name: "Colômbia", dialCode: "57", flag: "🇨🇴", nationalLength: 10 },
  { iso: "IN", name: "Índia", dialCode: "91", flag: "🇮🇳", nationalLength: 10 },
  { iso: "CN", name: "China", dialCode: "86", flag: "🇨🇳", nationalLength: 11 },
  { iso: "AE", name: "Emirados Árabes", dialCode: "971", flag: "🇦🇪", nationalLength: 9 },
  { iso: "SA", name: "Arábia Saudita", dialCode: "966", flag: "🇸🇦", nationalLength: 9 },
  { iso: "TR", name: "Turquia", dialCode: "90", flag: "🇹🇷", nationalLength: 10 },
  { iso: "RU", name: "Rússia", dialCode: "7", flag: "🇷🇺", nationalLength: 10 },
  { iso: "AU", name: "Austrália", dialCode: "61", flag: "🇦🇺", nationalLength: 9 },
];

export const DEFAULT_COUNTRY_ISO = "AO";

const byIso = new Map(COUNTRY_CALLING_CODES.map((c) => [c.iso, c]));
const byDialSorted = [...COUNTRY_CALLING_CODES].sort(
  (a, b) => b.dialCode.length - a.dialCode.length,
);

export function getCountryByIso(iso: string): CountryCallingCode {
  return byIso.get(iso) ?? COUNTRY_CALLING_CODES[0];
}

export function findCountryByDialCode(dialCode: string): CountryCallingCode | undefined {
  const d = dialCode.replace(/\D/g, "");
  return COUNTRY_CALLING_CODES.find((c) => c.dialCode === d);
}

/** Detecta indicativo + número nacional a partir de texto colado ou E.164. */
export function parsePhoneParts(raw: string): { iso: string; national: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  if (trimmed.startsWith("+") || digits.length > 10) {
    for (const c of byDialSorted) {
      if (digits.startsWith(c.dialCode)) {
        const national = digits.slice(c.dialCode.length);
        if (national.length >= 4) {
          return { iso: c.iso, national };
        }
      }
    }
  }

  if (!trimmed.startsWith("+") && digits.length <= 12) {
    return { iso: DEFAULT_COUNTRY_ISO, national: digits };
  }

  return null;
}
