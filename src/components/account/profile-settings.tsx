"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, MapPin, Trash2, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { ContaSection } from "@/components/account/conta-section";
import { AccountQuickLinks } from "@/components/account/account-quick-links";
import { ProfileHero } from "@/components/account/profile-hero";
import { ProfileIncompleteBlock } from "@/components/account/profile-incomplete-block";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/auth/require-auth";
import {
  saveProfilePhotoUrlAction,
  updateProfileAction,
  updateProfilePhotoAction,
} from "@/app/actions/profile";
import { deleteAccountAction } from "@/app/actions/compliance";
import { logoutBackend } from "@/lib/kumbu-api/auth";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";
import { updateStoreUser } from "@/lib/site-data";
import { uploadAvatarFile } from "@/lib/site-data";
import { promiseWithTimeout } from "@/lib/promise-timeout";
import { AngolaProvinceMunicipalityFields } from "@/components/geo/angola-province-municipality-fields";
import {
  getMissingProfileFieldKeys,
  getProfileFieldStatuses,
  isProfileComplete,
  profileFieldLabel,
} from "@/lib/profile-completion";
import { resizeAvatarFile } from "@/lib/images/resize-avatar";
import { normalizePhoneE164 } from "@/lib/phone";
import type { UserGender } from "@/lib/user-profile";
import {
  USER_GENDER_VALUES,
  birthDateToInputValue,
  isValidGender,
  maxBirthDateForInput,
  validateBirthDate,
  MIN_USER_AGE_YEARS,
} from "@/lib/user-profile";
import type { DeliveryAddress } from "@/types/store";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const GENDER_LABEL_KEYS = {
  feminino: "genderFeminine",
  masculino: "genderMasculine",
  outro: "genderOther",
} as const;

export function ProfileSettings() {
  const router = useRouter();
  const t = useTranslations("account");
  const tAuth = useTranslations("auth");
  const formatErrorMessage = useFormatErrorMessage();
  const { isLoggedIn, storeUser, user, applyStoreUser, isLoading } = useAuth();
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<UserGender | "">("");
  const [birthDate, setBirthDate] = useState("");
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState<DeliveryAddress>({
    line1: "",
    line2: "",
    city: "",
    zip: "",
    country: "Angola",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signupDevEmailLink, setSignupDevEmailLink] = useState<string | null>(null);

  useEffect(() => {
    const flash = sessionStorage.getItem("kumbu_signup_flash");
    if (flash) {
      setMessage(flash);
      sessionStorage.removeItem("kumbu_signup_flash");
    }
    const devLink = sessionStorage.getItem("kumbu_dev_email_link");
    if (devLink) {
      setSignupDevEmailLink(devLink);
      sessionStorage.removeItem("kumbu_dev_email_link");
    }
  }, []);

  useEffect(() => {
    if (!storeUser) return;
    setDisplayName(storeUser.displayName);
    setPhone(storeUser.phone ?? "");
    setGender(storeUser.gender ?? "");
    setBirthDate(birthDateToInputValue(storeUser.birthDate));
    setRegion(storeUser.region ?? "");
    if (storeUser.deliveryAddress) {
      setAddress({
        line1: storeUser.deliveryAddress.line1,
        line2: storeUser.deliveryAddress.line2 ?? "",
        city: storeUser.deliveryAddress.city,
        zip: storeUser.deliveryAddress.zip ?? "",
        country: storeUser.deliveryAddress.country || "Angola",
      });
    } else if (storeUser.city || storeUser.country) {
      setAddress((prev) => ({
        ...prev,
        city: storeUser.city ?? prev.city,
        country: storeUser.country ?? prev.country,
      }));
    }
  }, [storeUser]);

  async function handleAvatarChange(file: File | null) {
    if (!file || !user?.id) return;
    setAvatarBusy(true);
    setError(null);
    let prepared: File | null = null;

    try {
      prepared = await resizeAvatarFile(file);
      const baseUrl = await promiseWithTimeout(
        uploadAvatarFile(prepared),
        45_000,
        t("photoUploadTimeout"),
      );
      const photoUrl = `${baseUrl.replace(/\?.*$/, "")}?v=${Date.now()}`;

      try {
        const profile = await promiseWithTimeout(
          updateStoreUser({ photoUrl }),
          20_000,
          t("photoSaveTimeout"),
        );
        applyStoreUser(profile);
        showFeedback(null, t("photoUpdated"));
        return;
      } catch {
        const saved = await promiseWithTimeout(
          saveProfilePhotoUrlAction(photoUrl),
          25_000,
          t("photoSaveFailed"),
        );
        if (!saved.ok) {
          showFeedback(saved.error, null);
          return;
        }
        applyStoreUser(saved.profile);
        showFeedback(null, t("photoUpdated"));
        return;
      }
    } catch (clientErr) {
      if (!prepared) {
        showFeedback(formatErrorMessage(clientErr), null);
        return;
      }
      try {
        const formData = new FormData();
        formData.set("photo", prepared);
        const result = await promiseWithTimeout(
          updateProfilePhotoAction(formData),
          90_000,
          t("photoUploadLong"),
        );
        if (!result.ok) {
          showFeedback(result.error, null);
          return;
        }
        applyStoreUser(result.profile);
        showFeedback(null, t("photoUpdated"));
      } catch (err) {
        showFeedback(formatErrorMessage(err), null);
      }
    } finally {
      setAvatarBusy(false);
    }
  }

  function showFeedback(err: string | null, ok: string | null) {
    setError(err);
    setMessage(ok);
    requestAnimationFrame(() => {
      feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!user?.id) {
      showFeedback(t("sessionExpiredRelogin"), null);
      return;
    }

    const name = displayName.trim();
    const phoneNorm = normalizePhoneE164(phone);

    if (name.length < 2) {
      showFeedback(t("nameMinLength"), null);
      return;
    }
    if (!phoneNorm || phoneNorm.length < 10) {
      showFeedback(t("phoneInvalid"), null);
      return;
    }
    if (!address.line1.trim()) {
      showFeedback(t("addressRequired"), null);
      return;
    }
    if (!address.city.trim() || !address.country.trim() || !region.trim()) {
      showFeedback(t("cityProvinceCountryRequired"), null);
      return;
    }
    if (!isValidGender(gender)) {
      showFeedback(t("genderRequired"), null);
      return;
    }
    const birthErr = validateBirthDate(birthDate);
    if (birthErr) {
      showFeedback(
        birthErr === "birthDateMinAge"
          ? t(birthErr, { minAge: MIN_USER_AGE_YEARS })
          : t(birthErr),
        null,
      );
      return;
    }

    setSaving(true);
    try {
      const updatePayload = {
        displayName: name,
        phone: phoneNorm,
        gender,
        birthDate: birthDate.trim(),
        city: address.city.trim(),
        region: region.trim(),
        country: address.country.trim(),
        deliveryAddress: {
          line1: address.line1.trim(),
          line2: address.line2?.trim() || null,
          city: address.city.trim(),
          zip: address.zip?.trim() || null,
          country: address.country.trim(),
        },
      } as const;

      let savedProfile = storeUser;
      const result = await promiseWithTimeout(
        updateProfileAction(updatePayload),
        45_000,
        t("saveTimeout"),
      );

      if (!result.ok) {
        if (result.needsLogin) {
          router.push(`/login?next=/conta/perfil`);
        }
        showFeedback(result.error, null);
        return;
      }
      applyStoreUser(result.profile);
      savedProfile = result.profile;

      if (isProfileComplete(savedProfile)) {
        showFeedback(null, t("profileSavedComplete"));
      } else {
        const missing = getMissingProfileFieldKeys(savedProfile).map((key) =>
          profileFieldLabel(key, t),
        );
        showFeedback(
          null,
          missing.length > 0
            ? t("profileSavedIncomplete", { missing: missing.join(", ") })
            : t("profileUpdated"),
        );
      }
    } catch (err) {
      showFeedback(formatErrorMessage(err), null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm(t("deleteConfirm"))) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const result = await deleteAccountAction();
      if (!result.ok) {
        setError(result.error);
        if (result.needsLogin) {
          router.push("/login?next=/conta/perfil");
        }
        return;
      }
      logoutBackend();
      router.push("/?account_deleted=1");
      router.refresh();
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  if (isLoading) {
    return <p className="mt-8 text-center text-sm text-kumbu-muted">{t("profileLoading")}</p>;
  }

  if (!isLoggedIn) {
    return (
      <div className="kumbu-card mt-4 p-6 text-center">
        <p className="text-sm text-kumbu-muted">{t("profileLoginPrompt")}</p>
        <Button href="/login?next=/conta/perfil" className="mt-4">
          <LogIn className="size-4" />
          {tAuth("login")}
        </Button>
        <p className="mt-3 text-sm">
          <Link href="/registo" className="font-semibold text-kumbu-primary">
            {tAuth("register")}
          </Link>
        </p>
      </div>
    );
  }

  const email = user?.email ?? storeUser?.email ?? "";
  const profileFields = getProfileFieldStatuses(storeUser);
  const profileComplete = isProfileComplete(storeUser);
  const completionPct = profileFields.length
    ? Math.round(
        (profileFields.filter((field) => field.complete).length / profileFields.length) * 100,
      )
    : 0;

  return (
    <RequireAuth>
      <div className="space-y-5">
        {!profileComplete && (
          <ProfileIncompleteBlock
            fields={profileFields}
            title={t("profileCompleteTitle")}
            description={t("profileCompleteDescription")}
          />
        )}

        {profileComplete && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              ✓
            </span>
            <p className="font-semibold">{t("profileCompleteBanner")}</p>
          </div>
        )}

        <ProfileHero
          displayName={displayName}
          email={email}
          photoUrl={storeUser?.photoUrl}
          initials={initials(displayName || email)}
          avatarBusy={avatarBusy}
          completionPct={completionPct}
          profileComplete={profileComplete}
          signupDevEmailLink={signupDevEmailLink}
          onAvatarChange={(file) => void handleAvatarChange(file)}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start">
          <form onSubmit={saveProfile} noValidate className="kumbu-card space-y-5 p-5 sm:p-6">
            <div>
              <h2 className="text-base font-bold tracking-tight">{t("profileInfoTitle")}</h2>
              <p className="mt-1 text-sm text-kumbu-muted">{t("profileInfoDescription")}</p>
            </div>

            <ContaSection
              icon={User}
              title={t("personalDataTitle")}
              description={t("personalDataDescription")}
            >
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-semibold text-kumbu-foreground">{t("displayName")}</span>
                <input
                  required
                  minLength={2}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="kumbu-input font-normal"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-semibold text-kumbu-foreground">{t("phone")}</span>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="kumbu-input font-normal"
                  placeholder={t("phonePlaceholder")}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-semibold text-kumbu-foreground">{t("gender")} *</span>
                  <select
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value as UserGender | "")}
                    className="kumbu-input font-normal"
                  >
                    <option value="">{t("genderSelect")}</option>
                    {USER_GENDER_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {t(GENDER_LABEL_KEYS[value])}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-semibold text-kumbu-foreground">{t("birthDate")} *</span>
                  <input
                    required
                    type="date"
                    value={birthDate}
                    max={maxBirthDateForInput()}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="kumbu-input font-normal"
                  />
                </label>
              </div>
              <p className="text-xs leading-relaxed text-kumbu-muted">
                {t("ageVerificationNote", { minAge: MIN_USER_AGE_YEARS })}
              </p>
            </ContaSection>

            <ContaSection
              icon={MapPin}
              title={t("deliveryAddressTitle")}
              description={t("deliveryAddressDescription")}
            >
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-semibold text-kumbu-foreground">{t("address")}</span>
                <input
                  required
                  value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                  className="kumbu-input font-normal"
                />
              </label>
              <AngolaProvinceMunicipalityFields
                province={region}
                municipality={address.city}
                onProvinceChange={setRegion}
                onMunicipalityChange={(city) => setAddress({ ...address, city })}
                municipalityLabel={t("municipality")}
              />
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-semibold text-kumbu-foreground">{t("country")}</span>
                <input
                  required
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="kumbu-input font-normal"
                />
              </label>
            </ContaSection>

            <div ref={feedbackRef} className="space-y-2">
              {message && (
                <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 ring-1 ring-emerald-100">
                  {message}
                </p>
              )}
              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-red-100">
                  {error}
                </p>
              )}
            </div>

            <Button type="submit" fullWidth disabled={saving || avatarBusy} className="h-12 text-[15px]">
              {saving ? t("saving") : t("saveProfile")}
            </Button>
          </form>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="hidden lg:block">
              <AccountQuickLinks variant="sidebar" />
            </div>
            <div className="kumbu-card border-red-200/70 bg-red-50/20 p-5">
              <h3 className="text-sm font-bold text-red-800">{t("dangerZoneTitle")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-kumbu-muted">
                {t("dangerZoneDescription")}
              </p>
              <Button
                type="button"
                variant="outline"
                fullWidth
                className="mt-4 h-11 border-red-300/80 bg-kumbu-surface text-red-700 hover:bg-red-50"
                disabled={deleting}
                onClick={() => void handleDeleteAccount()}
              >
                <Trash2 className="size-4" />
                {deleting ? t("deleting") : t("deleteAccount")}
              </Button>
            </div>
          </aside>
        </div>

        <div className="lg:hidden">
          <AccountQuickLinks />
        </div>
      </div>
    </RequireAuth>
  );
}
