
export type UserGender = "feminino" | "masculino" | "outro";

export const USER_GENDER_VALUES: UserGender[] = ["feminino", "masculino", "outro"];

export type GenderTranslator = (
  key: "genderFeminine" | "genderMasculine" | "genderOther",
) => string;

const GENDER_LABEL_KEYS: Record<UserGender, "genderFeminine" | "genderMasculine" | "genderOther"> = {
  feminino: "genderFeminine",
  masculino: "genderMasculine",
  outro: "genderOther",
};

export const MIN_USER_AGE_YEARS = 18;

export function genderLabel(
  value: string | null | undefined,
  t: GenderTranslator,
): string {
  if (isValidGender(value)) return t(GENDER_LABEL_KEYS[value]);
  return value ?? "—";
}

export function isValidGender(value: string | null | undefined): value is UserGender {
  return USER_GENDER_VALUES.some((o) => o === value);
}

export function birthDateToInputValue(iso: string | null | undefined): string {
  if (!iso?.trim()) return "";
  const d = iso.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : "";
}

export function parseBirthDateInput(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const [y, m, d] = v.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return v;
}

export function ageFromBirthDate(iso: string): number | null {
  const parsed = parseBirthDateInput(iso);
  if (!parsed) return null;
  const [y, m, d] = parsed.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - y;
  const monthDiff = today.getMonth() - (m - 1);
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) age--;
  return age;
}

export type BirthDateErrorKey =
  | "birthDateRequired"
  | "birthDateInvalid"
  | "birthDateMinAge"
  | "birthDateFuture"
  | "birthDateVerify";

export function validateBirthDate(
  iso: string | null | undefined,
): BirthDateErrorKey | null {
  if (!iso?.trim()) return "birthDateRequired";
  const parsed = parseBirthDateInput(iso);
  if (!parsed) return "birthDateInvalid";
  const age = ageFromBirthDate(parsed);
  if (age == null) return "birthDateInvalid";
  if (age < MIN_USER_AGE_YEARS) {
    return "birthDateMinAge";
  }
  if (age > 120) return "birthDateVerify";
  const maxDate = new Date();
  const minDate = new Date(
    maxDate.getFullYear() - 120,
    maxDate.getMonth(),
    maxDate.getDate(),
  );
  const birth = new Date(parsed);
  if (birth > maxDate) return "birthDateFuture";
  if (birth < minDate) return "birthDateInvalid";
  return null;
}

export function maxBirthDateForInput(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - MIN_USER_AGE_YEARS);
  return d.toISOString().slice(0, 10);
}
