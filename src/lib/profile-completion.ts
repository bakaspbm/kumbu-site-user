import { normalizePhoneE164 } from "@/lib/phone";
import { isValidGender, validateBirthDate } from "@/lib/user-profile";
import type { StoreUser } from "@/types/store";

export type ProfileFieldKey =
  | "displayName"
  | "phone"
  | "gender"
  | "birthDate"
  | "line1"
  | "city"
  | "region"
  | "country";

export interface ProfileFieldStatus {
  key: ProfileFieldKey;
  complete: boolean;
}

const PROFILE_FIELD_KEYS: ProfileFieldKey[] = [
  "displayName",
  "phone",
  "gender",
  "birthDate",
  "line1",
  "city",
  "region",
  "country",
];

export type ProfileFieldLabelKey =
  | "fieldDisplayName"
  | "fieldPhone"
  | "fieldGender"
  | "fieldBirthDate"
  | "fieldAddress"
  | "fieldCity"
  | "fieldRegion"
  | "fieldCountry";

export type ProfileFieldTranslator = (key: ProfileFieldLabelKey) => string;

const FIELD_LABEL_KEYS: Record<ProfileFieldKey, ProfileFieldLabelKey> = {
  displayName: "fieldDisplayName",
  phone: "fieldPhone",
  gender: "fieldGender",
  birthDate: "fieldBirthDate",
  line1: "fieldAddress",
  city: "fieldCity",
  region: "fieldRegion",
  country: "fieldCountry",
};

export function profileFieldLabel(
  key: ProfileFieldKey,
  t: ProfileFieldTranslator,
): string {
  return t(FIELD_LABEL_KEYS[key]);
}

export function getProfileFieldStatuses(
  user: StoreUser | null | undefined,
): ProfileFieldStatus[] {
  if (!user) {
    return PROFILE_FIELD_KEYS.map((key) => ({ key, complete: false }));
  }

  const phone = normalizePhoneE164(user.phone ?? "");
  const addr = user.deliveryAddress;
  const line1 = addr?.line1?.trim() ?? "";
  const city = user.city?.trim() || addr?.city?.trim() || "";
  const country = user.country?.trim() || addr?.country?.trim() || "";

  return [
    {
      key: "displayName",
      complete: user.displayName.trim().length >= 2,
    },
    {
      key: "phone",
      complete: phone.length >= 9,
    },
    {
      key: "gender",
      complete: isValidGender(user.gender),
    },
    {
      key: "birthDate",
      complete: validateBirthDate(user.birthDate) === null && Boolean(user.birthDate),
    },
    {
      key: "line1",
      complete: line1.length >= 2,
    },
    {
      key: "city",
      complete: city.length >= 2,
    },
    {
      key: "region",
      complete: Boolean(user.region?.trim()),
    },
    {
      key: "country",
      complete: country.length >= 2,
    },
  ];
}

export function isProfileComplete(user: StoreUser | null | undefined): boolean {
  if (!user) return false;
  if (typeof user.profileComplete === "boolean") return user.profileComplete;
  if (typeof user.canPublish === "boolean") return user.canPublish;
  return getProfileFieldStatuses(user).every((f) => f.complete);
}

export function getMissingProfileFieldKeys(
  user: StoreUser | null | undefined,
): ProfileFieldKey[] {
  return getProfileFieldStatuses(user)
    .filter((f) => !f.complete)
    .map((f) => f.key);
}

export type ProfilePublishTranslator = (
  key: "incompletePublish" | "incompletePublishMissing",
  values?: { missing?: string },
) => string;

export function getProfileIncompletePublishMessage(
  user: StoreUser | null | undefined,
  t: ProfilePublishTranslator,
  fieldT: ProfileFieldTranslator,
): string {
  const missing = getMissingProfileFieldKeys(user).map((key) =>
    profileFieldLabel(key, fieldT),
  );
  if (missing.length === 0) return t("incompletePublish");
  return t("incompletePublishMissing", { missing: missing.join(", ") });
}

/** @deprecated Use getMissingProfileFieldKeys with translation at call site */
export function getMissingProfileLabels(
  user: StoreUser | null | undefined,
): string[] {
  return getMissingProfileFieldKeys(user);
}
