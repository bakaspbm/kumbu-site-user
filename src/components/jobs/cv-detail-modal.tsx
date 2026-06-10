"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { X, Download, Mail, Phone, MapPin } from "lucide-react";
import { recordJobApplicationCvView } from "@/lib/site-data";
import { CvDetailPreview } from "@/components/jobs/cv-detail-preview";
import { Button } from "@/components/ui/button";
import { downloadCvPdf } from "@/lib/cv/generate-cv-pdf";
import type { JobApplication } from "@/types/job";

interface CvDetailModalProps {
  application: JobApplication;
  onClose: () => void;
  onViewRecorded?: (applicationId: string) => void;
}

export function CvDetailModal({
  application,
  onClose,
  onViewRecorded,
}: CvDetailModalProps) {
  const t = useTranslations("jobs.cv");
  const recordedRef = useRef(false);
  const cv = application.cvSnapshot;

  useEffect(() => {
    if (!cv) return;
    onViewRecorded?.(application.id);
    if (recordedRef.current) return;
    recordedRef.current = true;
    void recordJobApplicationCvView(application.id).catch(() => {});
  }, [application.id, cv, onViewRecorded]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!cv) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-kumbu-surface shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-kumbu-border bg-kumbu-surface/95 px-4 py-3 backdrop-blur-md">
          <div className="min-w-0">
            <h2 id="cv-modal-title" className="truncate font-extrabold text-kumbu-foreground">
              {cv.fullName}
            </h2>
            <p className="truncate text-xs text-kumbu-muted">
              {cv.title}
              {cv.profession ? ` · ${cv.profession}` : ""}
              {application.jobTitle ? ` · ${application.jobTitle}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-kumbu-muted hover:bg-kumbu-surface-muted"
            aria-label={t("close")}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="flex flex-wrap gap-2 text-xs text-kumbu-muted">
            {cv.email && (
              <span className="inline-flex items-center gap-1 rounded-full bg-kumbu-surface-muted px-2.5 py-1">
                <Mail className="size-3" />
                {cv.email}
              </span>
            )}
            {cv.phone && (
              <span className="inline-flex items-center gap-1 rounded-full bg-kumbu-surface-muted px-2.5 py-1">
                <Phone className="size-3" />
                {cv.phone}
              </span>
            )}
            {(cv.city || cv.province) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-kumbu-surface-muted px-2.5 py-1">
                <MapPin className="size-3" />
                {[cv.city, cv.province].filter(Boolean).join(", ")}
              </span>
            )}
          </div>

          <CvDetailPreview cv={cv} />

          {application.coverMessage && (
            <div className="rounded-xl border border-kumbu-border bg-kumbu-primary-soft/30 p-3">
              <p className="text-xs font-bold uppercase text-kumbu-muted">{t("applicationMessage")}</p>
              <p className="mt-1 text-sm text-kumbu-foreground">{application.coverMessage}</p>
            </div>
          )}

          <Button
            type="button"
            variant="secondary"
            fullWidth
            className="gap-2"
            onClick={() => void downloadCvPdf(cv)}
          >
            <Download className="size-4" />
            {t("downloadPdf")}
          </Button>
        </div>
      </div>
    </div>
  );
}
