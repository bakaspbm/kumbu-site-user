"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Flag, X } from "lucide-react";
import { submitReportAction } from "@/app/actions/compliance";
import type { ReportReasonId } from "@/lib/legal/content";
import { Button } from "@/components/ui/button";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import type { ContentReportTargetType } from "@/lib/legal/content";

interface ReportContentDialogProps {
  targetType: ContentReportTargetType;
  targetId: string;
  reportedUserId?: string | null;
  label?: string;
  className?: string;
}

export function ReportContentDialog({
  targetType,
  targetId,
  reportedUserId,
  label,
  className,
}: ReportContentDialogProps) {
  const t = useTranslations("legalContent.reportDialog");
  const tCommon = useTranslations("common");
  const tLegal = useTranslations("legalContent");
  const reportReasons = tLegal.raw("reportReasons") as {
    id: ReportReasonId;
    label: string;
  }[];
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReasonId>("misleading");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const closeTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  function closeDialog() {
    setOpen(false);
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setMessage(null);
    const result = await submitReportAction({
      targetType,
      targetId,
      reportedUserId,
      reason,
      details,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      if (result.needsLogin) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      }
      return;
    }
    setMessage(t("reportSent"));
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setMessage(null);
          setError(null);
        }}
        className={
          className ??
          "inline-flex items-center gap-1.5 text-sm font-semibold text-kumbu-muted hover:text-red-600"
        }
      >
        <Flag className="size-4" aria-hidden />
        {label ?? t("label")}
      </button>

      <ModalOverlay
        open={open}
        onClose={closeDialog}
        ariaLabelledBy="report-dialog-title"
        panelClassName="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-kumbu-surface p-5 shadow-xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="report-dialog-title" className="font-extrabold">
            {t("title")}
          </h2>
          <button
            type="button"
            onClick={closeDialog}
            className="rounded-full p-2 text-kumbu-muted hover:bg-kumbu-secondary"
            aria-label={tCommon("close")}
          >
            <X className="size-5" />
          </button>
        </div>
        <p className="mt-2 text-xs text-kumbu-muted">{t("description")}</p>

        <label className="mt-4 flex flex-col gap-1.5 text-sm font-semibold">
          {t("reasonLabel")}
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as ReportReasonId)}
            className="kumbu-input font-normal"
          >
            {reportReasons.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-3 flex flex-col gap-1.5 text-sm font-semibold">
          {t("detailsLabel")}
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="kumbu-input min-h-[80px] font-normal"
            maxLength={2000}
            placeholder={t("detailsPlaceholder")}
          />
        </label>

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {message}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="h-11 flex-1"
            onClick={closeDialog}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="button"
            className="h-11 flex-1"
            disabled={loading}
            onClick={() => void handleSubmit()}
          >
            {loading ? tCommon("sending") : t("submit")}
          </Button>
        </div>
      </ModalOverlay>
    </>
  );
}
