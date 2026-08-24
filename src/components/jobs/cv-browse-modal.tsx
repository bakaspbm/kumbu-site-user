"use client";

import { useTranslations } from "next-intl";
import { X, Download, Mail, Phone, MapPin } from "lucide-react";
import { CvDetailPreview } from "@/components/jobs/cv-detail-preview";
import { Button } from "@/components/ui/button";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { downloadCvPdf } from "@/lib/cv/generate-cv-pdf";
import type { UserCv } from "@/types/job";

interface CvBrowseModalProps {
  cv: UserCv;
  onClose: () => void;
}

export function CvBrowseModal({ cv, onClose }: CvBrowseModalProps) {
  const t = useTranslations("jobs.cv");

  return (
    <ModalOverlay
      open
      onClose={onClose}
      ariaLabelledBy="cv-browse-title"
      panelClassName="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-kumbu-surface shadow-xl sm:rounded-3xl"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-kumbu-border bg-kumbu-surface px-4 py-3">
        <div className="min-w-0">
          <h2 id="cv-browse-title" className="truncate font-extrabold text-kumbu-foreground">
            {cv.fullName}
          </h2>
          <p className="truncate text-xs text-kumbu-muted">
            {cv.title}
            {cv.profession ? ` · ${cv.profession}` : ""}
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
    </ModalOverlay>
  );
}
