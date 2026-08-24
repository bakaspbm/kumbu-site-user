"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { ContaPageHeader } from "@/components/account/conta-page-header";
import { ContaPanel, ContaSection } from "@/components/account/conta-section";
import { CvExperienceEditor } from "@/components/jobs/cv-experience-editor";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/auth/require-auth";
import {
  normalizeExperience,
  validateExperiences,
} from "@/lib/cv/experience";
import { downloadCvPdf } from "@/lib/cv/generate-cv-pdf";
import { JOB_SECTORS } from "@/lib/jobs/constants";
import { useJobSectorLabel } from "@/lib/i18n/use-job-labels";
import {
  createCvAction,
  deleteCvAction,
  listMyCvsAction,
  updateCvAction,
} from "@/app/actions/cv";
import { promiseWithTimeout } from "@/lib/promise-timeout";
import { useAuth } from "@/contexts/auth-context";
import { AngolaProvinceMunicipalityFields } from "@/components/geo/angola-province-municipality-fields";
import {
  PhoneNumberInput,
  phoneInputHint,
  readStoredPhoneCountryIso,
  storePhoneCountryIso,
} from "@/components/auth/phone-number-input";
import {
  DEFAULT_COUNTRY_ISO,
  buildPhoneFromCountry,
  clampNationalDigits,
  parsePhoneParts,
  validateNationalForCountry,
} from "@/lib/phone";
import type { UserCv, UserCvInsert } from "@/types/job";

export default function CvsPage() {
  const t = useTranslations("jobs.cvs");
  const tCommon = useTranslations("common");
  const sectorLabel = useJobSectorLabel();
  const { storeUser, user } = useAuth();

  const emptyForm = useCallback(
    (): UserCvInsert => ({
      title: t("defaultTitle"),
      profession: JOB_SECTORS[0],
      fullName: "",
      email: "",
      phone: "",
      city: "",
      province: "Luanda",
      summary: "",
      experience: [],
      skills: [],
      languages: [t("defaultLanguage")],
    }),
    [t],
  );

  const [cvs, setCvs] = useState<UserCv[]>([]);
  const [form, setForm] = useState<UserCvInsert>(emptyForm());
  const [phoneCountryIso, setPhoneCountryIso] = useState(readStoredPhoneCountryIso);
  const [phoneNational, setPhoneNational] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [skillsText, setSkillsText] = useState("");
  const [busy, setBusy] = useState(false);
  const [pdfBusyId, setPdfBusyId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoadError(null);
    const result = await listMyCvsAction();
    if (result.ok) setCvs(result.cvs);
    else {
      setLoadError(result.error ?? t("loadError"));
      setCvs([]);
    }
  }, [user?.id, t]);

  function applyPhoneToForm(iso: string, national: string) {
    setPhoneCountryIso(iso);
    setPhoneNational(national);
    storePhoneCountryIso(iso);
    setForm((f) => ({
      ...f,
      phone: national ? buildPhoneFromCountry(iso, national) : "",
    }));
  }

  function hydratePhone(raw: string | null | undefined) {
    const parts = parsePhoneParts(raw ?? "");
    if (parts) {
      applyPhoneToForm(parts.iso, clampNationalDigits(parts.national, parts.iso));
      return;
    }
    applyPhoneToForm(DEFAULT_COUNTRY_ISO, clampNationalDigits(raw ?? "", DEFAULT_COUNTRY_ISO));
  }

  useEffect(() => {
    void load();
    if (storeUser?.displayName && !form.fullName) {
      setForm((f) => ({
        ...f,
        fullName: storeUser.displayName,
        email: user?.email ?? storeUser.email,
        city: storeUser.deliveryAddress?.city ?? "",
      }));
      hydratePhone(storeUser.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só pré-preenche quando o perfil chega
  }, [load, storeUser, user, form.fullName]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) {
      alert(t("loginBeforeCreate"));
      return;
    }
    if (!form.profession?.trim()) {
      alert(t("selectProfession"));
      return;
    }
    let phoneValue = "";
    if (phoneNational.trim()) {
      const phoneChecked = validateNationalForCountry(phoneCountryIso, phoneNational);
      if (!phoneChecked.ok) {
        alert(t("phoneInvalid"));
        return;
      }
      phoneValue = phoneChecked.phone;
    }
    const experiences = normalizeExperience(form.experience ?? []);
    const expError = validateExperiences(experiences);
    if (expError) {
      alert(expError);
      return;
    }

    setBusy(true);
    const payload: UserCvInsert = {
      ...form,
      phone: phoneValue,
      profession: form.profession.trim(),
      experience: experiences,
      skills: skillsText.split(",").map((s) => s.trim()).filter(Boolean),
    };

    try {
      const result = editingId
        ? await promiseWithTimeout(
            updateCvAction(editingId, payload),
            60_000,
            t("saveTimeout"),
          )
        : await promiseWithTimeout(
            createCvAction(payload),
            60_000,
            t("createTimeout"),
          );
      if (!result.ok) {
        alert(result.error);
        return;
      }
    } catch {}

    try {
      setEditingId(null);
      setForm(emptyForm());
      setPhoneCountryIso(readStoredPhoneCountryIso());
      setPhoneNational("");
      setSkillsText("");
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : tCommon("error"));
    } finally {
      setBusy(false);
    }
  }

  function startEdit(cv: UserCv) {
    setEditingId(cv.id);
    setForm({
      title: cv.title,
      profession: cv.profession ?? JOB_SECTORS[0],
      fullName: cv.fullName,
      email: cv.email ?? "",
      phone: cv.phone ?? "",
      city: cv.city ?? "",
      province: cv.province ?? "Luanda",
      summary: cv.summary ?? "",
      experience: cv.experience,
      skills: cv.skills,
      languages: cv.languages,
    });
    hydratePhone(cv.phone);
    setSkillsText(cv.skills.join(", "));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
    setPhoneCountryIso(readStoredPhoneCountryIso());
    setPhoneNational("");
    setSkillsText("");
  }

  async function exportPdf(cv: UserCv) {
    setPdfBusyId(cv.id);
    try {
      await downloadCvPdf(cv);
    } catch (err) {
      alert(err instanceof Error ? err.message : t("pdfError"));
    } finally {
      setPdfBusyId(null);
    }
  }

  return (
    <RequireAuth>
      <div className="space-y-5">
        <ContaPanel>
          <ContaPageHeader
            icon={FileText}
            title={t("title")}
            description={t("description")}
          />
        </ContaPanel>

        {loadError && (
          <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-red-100" role="alert">
            {loadError}
          </p>
        )}

        <ContaPanel>
          <ContaSection
            icon={FileText}
            title={editingId ? t("editCv") : t("newCv")}
            description={t("sectionDesc")}
          >
        <form onSubmit={save} className="space-y-3">
          <input
            required
            placeholder={t("titlePlaceholder")}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="kumbu-input"
          />
          <label className="flex flex-col gap-1 text-xs font-semibold">
            {t("professionLabel")}
            <select
              required
              value={form.profession ?? ""}
              onChange={(e) => setForm({ ...form, profession: e.target.value })}
              className="kumbu-input font-normal"
            >
              {JOB_SECTORS.map((s) => (
                <option key={s} value={s}>
                  {sectorLabel(s)}
                </option>
              ))}
            </select>
          </label>
          <input
            required
            placeholder={t("fullNamePlaceholder")}
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="kumbu-input"
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              placeholder={t("emailPlaceholder")}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="kumbu-input"
            />
            <div className="flex flex-col gap-1">
              <PhoneNumberInput
                id="cv-phone"
                countryIso={phoneCountryIso}
                onCountryIsoChange={(iso) => applyPhoneToForm(iso, phoneNational)}
                nationalNumber={phoneNational}
                onNationalNumberChange={(national) => applyPhoneToForm(phoneCountryIso, national)}
              />
              <span id="cv-phone-hint" className="text-[11px] text-kumbu-muted">
                {phoneInputHint(phoneCountryIso)}
              </span>
            </div>
          </div>
          <AngolaProvinceMunicipalityFields
            province={form.province ?? ""}
            municipality={form.city ?? ""}
            onProvinceChange={(province) => setForm({ ...form, province })}
            onMunicipalityChange={(city) => setForm({ ...form, city })}
            gridClassName="grid grid-cols-1 gap-2 sm:grid-cols-2"
          />
          <textarea
            placeholder={t("summaryPlaceholder")}
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            className="kumbu-input min-h-[80px]"
          />
          <CvExperienceEditor
            value={form.experience ?? []}
            onChange={(experience) => setForm({ ...form, experience })}
          />
          <input
            placeholder={t("skillsPlaceholder")}
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            className="kumbu-input"
          />
          <div className="flex gap-2">
            {editingId && (
              <Button type="button" variant="outline" className="flex-1" onClick={cancelEdit}>
                {tCommon("cancel")}
              </Button>
            )}
            <Button type="submit" fullWidth disabled={busy} className={editingId ? "flex-1" : ""}>
              {busy ? tCommon("saving") : editingId ? t("update") : t("create")}
            </Button>
          </div>
        </form>
          </ContaSection>
        </ContaPanel>

        <ul className="kumbu-card-grid">
          {cvs.map((cv) => (
            <li key={cv.id} className="kumbu-card-elevated flex flex-col space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{cv.title}</p>
                  <p className="text-sm text-kumbu-muted">{cv.fullName}</p>
                  {cv.profession && (
                    <p className="text-xs font-semibold text-kumbu-primary">{sectorLabel(cv.profession)}</p>
                  )}
                  {cv.experience.length > 0 && (
                    <p className="text-xs text-kumbu-muted">
                      {t("experienceCount", { count: cv.experience.length })}
                    </p>
                  )}
                </div>
                <FileText className="size-5 shrink-0 text-kumbu-muted" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={() => startEdit(cv)}>
                  {t("edit")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1"
                  disabled={pdfBusyId === cv.id}
                  onClick={() => void exportPdf(cv)}
                >
                  <Download className="size-4" />
                  {pdfBusyId === cv.id ? t("generatingPdf") : t("pdfKumbu")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (confirm(t("deleteConfirm"))) {
                      void (async () => {
                        try {
                          const r = await deleteCvAction(cv.id);
                          if (!r.ok) throw new Error(r.error);
                          if (editingId === cv.id) cancelEdit();
                          await load();
                        } catch (err) {
                          alert(err instanceof Error ? err.message : t("deleteError"));
                        }
                      })();
                    }
                  }}
                >
                  {t("delete")}
                </Button>
              </div>
            </li>
          ))}
        </ul>

        <Button href="/emprego" variant="secondary" fullWidth>
          {t("viewJobs")}
        </Button>
      </div>
    </RequireAuth>
  );
}
