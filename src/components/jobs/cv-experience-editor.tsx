"use client";

import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { emptyExperience } from "@/lib/cv/experience";
import type { CvExperienceEntry } from "@/types/job";

interface CvExperienceEditorProps {
  value: CvExperienceEntry[];
  onChange: (list: CvExperienceEntry[]) => void;
}

export function CvExperienceEditor({ value, onChange }: CvExperienceEditorProps) {
  const t = useTranslations("jobs.cv");

  function update(index: number, patch: Partial<CvExperienceEntry>) {
    onChange(value.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold">{t("experienceTitle")}</p>
        <Button
          type="button"
          variant="secondary"
          className="h-9 gap-1 text-xs"
          onClick={() => onChange([...value, emptyExperience()])}
        >
          <Plus className="size-3.5" />
          {t("add")}
        </Button>
      </div>

      {value.length === 0 && (
        <p className="rounded-xl border border-dashed border-kumbu-border px-3 py-4 text-center text-xs text-kumbu-muted">
          {t("experienceEmpty")}
        </p>
      )}

      {value.map((exp, index) => (
        <div key={index} className="kumbu-card space-y-2 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-kumbu-primary">
              {t("experienceN", { n: index + 1 })}
            </span>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-kumbu-muted hover:text-red-600"
              aria-label={t("remove")}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <input
            required
            placeholder={t("companyPlaceholder")}
            value={exp.company}
            onChange={(e) => update(index, { company: e.target.value })}
            className="kumbu-input text-sm"
          />
          <input
            required
            placeholder={t("positionPlaceholder")}
            value={exp.position}
            onChange={(e) => update(index, { position: e.target.value })}
            className="kumbu-input text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs font-semibold">
              {t("started")}
              <input
                type="month"
                required
                value={exp.startDate}
                onChange={(e) => update(index, { startDate: e.target.value })}
                className="kumbu-input text-sm font-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold">
              {t("ended")}
              <input
                type="month"
                disabled={exp.current}
                value={exp.endDate ?? ""}
                onChange={(e) => update(index, { endDate: e.target.value })}
                className="kumbu-input text-sm font-normal disabled:opacity-50"
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={exp.current}
              onChange={(e) =>
                update(index, {
                  current: e.target.checked,
                  endDate: e.target.checked ? null : "",
                })
              }
            />
            {t("stillWorking")}
          </label>
          <textarea
            required
            placeholder={t("descriptionPlaceholder")}
            value={exp.description}
            onChange={(e) => update(index, { description: e.target.value })}
            className="kumbu-input min-h-[72px] text-sm font-normal"
          />
        </div>
      ))}
    </div>
  );
}
