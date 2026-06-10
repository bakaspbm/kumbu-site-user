"use client";

import { formatExperiencePeriod } from "@/lib/cv/experience";
import type { UserCv } from "@/types/job";

interface CvDetailPreviewProps {
  cv: UserCv;
  compact?: boolean;
}

export function CvDetailPreview({ cv, compact }: CvDetailPreviewProps) {
  const experience = cv.experience ?? [];
  const education = cv.education ?? [];
  const skills = cv.skills ?? [];
  const languages = cv.languages ?? [];

  return (
    <div className={compact ? "space-y-2 text-sm" : "space-y-4"}>
      {cv.profession && (
        <p className="font-semibold text-kumbu-primary">{cv.profession}</p>
      )}
      {cv.summary && (
        <p className={compact ? "line-clamp-3 text-kumbu-muted" : "text-kumbu-muted leading-relaxed"}>
          {cv.summary}
        </p>
      )}
      {experience.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-kumbu-muted">
            Experiência
          </p>
          <ul className="mt-1 space-y-2">
            {experience.map((exp, i) => (
              <li key={i} className="rounded-lg bg-kumbu-surface/80 px-2 py-1.5">
                <p className="font-semibold">
                  {exp.position} — {exp.company}
                </p>
                <p className="text-xs text-kumbu-muted">{formatExperiencePeriod(exp)}</p>
                {!compact && exp.description && (
                  <p className="mt-1 text-xs text-kumbu-muted">{exp.description}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {education.length > 0 && !compact && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-kumbu-muted">
            Formação
          </p>
          <ul className="mt-1 space-y-2">
            {education.map((edu, i) => (
              <li key={i} className="rounded-lg bg-kumbu-surface/80 px-2 py-1.5">
                <p className="font-semibold">{edu.course}</p>
                <p className="text-xs text-kumbu-muted">
                  {edu.institution}
                  {edu.period ? ` · ${edu.period}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {skills.length > 0 && (
        <p className="text-xs text-kumbu-muted">
          <span className="font-bold">Competências:</span> {skills.join(", ")}
        </p>
      )}
      {languages.length > 0 && !compact && (
        <p className="text-xs text-kumbu-muted">
          <span className="font-bold">Idiomas:</span> {languages.join(", ")}
        </p>
      )}
    </div>
  );
}
