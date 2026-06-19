"use client";

import { useEffect, useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  getIdentityStatusBackend,
  submitIdentityVerificationBackend,
  uploadIdentityDocumentBackend,
  type IdentitySide,
} from "@/lib/kumbu-api/files";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export function IdentityUpload() {
  const { isLoggedIn } = useAuth();
  const t = useTranslations("account");
  const [busy, setBusy] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<Record<IdentitySide, boolean>>({
    front: false,
    back: false,
    selfie: false,
  });
  const [documentReviews, setDocumentReviews] = useState<
    Partial<Record<IdentitySide, { status: string; rejection_reason: string | null }>>
  >({});
  const [reviewStatus, setReviewStatus] = useState("NOT_SUBMITTED");
  const [adminNote, setAdminNote] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const sides = useMemo(
    (): { id: IdentitySide; label: string }[] => [
      { id: "front", label: t("identityFront") },
      { id: "back", label: t("identityBack") },
      { id: "selfie", label: t("identitySelfie") },
    ],
    [t],
  );

  const reviewLabels = useMemo(
    (): Record<string, string> => ({
      NOT_SUBMITTED: t("identityNotSubmitted"),
      PENDING: t("identityPending"),
      APPROVED: t("identityApproved"),
      REJECTED: t("identityRejected"),
    }),
    [t],
  );

  function applyStatus(status: Awaited<ReturnType<typeof getIdentityStatusBackend>>) {
    setUploaded(status.uploaded);
    setReviewStatus(status.reviewStatus);
    setAdminNote(status.adminNote ?? null);
    setDocumentReviews(status.documentReviews ?? {});
  }

  useEffect(() => {
    if (!isLoggedIn) return;
    void (async () => {
      try {
        applyStatus(await getIdentityStatusBackend());
      } catch {
        /* ignore */
      }
    })();
  }, [isLoggedIn]);

  async function handleFile(side: IdentitySide, file: File | null) {
    if (!file || !isLoggedIn) return;
    setError(null);
    setMessage(null);
    setBusy(side);
    try {
      applyStatus(await uploadIdentityDocumentBackend(side, file));
      setMessage(t("identityUploadSuccess"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("identityUploadError"));
    } finally {
      setBusy(null);
    }
  }

  async function handleSubmit() {
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      applyStatus(await submitIdentityVerificationBackend());
      setMessage(t("identitySubmitSuccess"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("identitySubmitError"));
    } finally {
      setSubmitting(false);
    }
  }

  const complete = sides.every(({ id }) => uploaded[id]);
  const statusLabel = reviewLabels[reviewStatus] ?? reviewStatus;
  const hasRejectedDocs = sides.some(
    ({ id }) => documentReviews[id]?.status === "REJECTED",
  );
  const canSubmit =
    complete &&
    !submitting &&
    reviewStatus !== "PENDING" &&
    reviewStatus !== "APPROVED" &&
    !hasRejectedDocs;

  return (
    <div className="space-y-3">
      <p className="text-sm text-kumbu-muted">{t("identityIntro")}</p>
      <p className="text-xs font-semibold text-kumbu-foreground">
        {t("identityStatus", { status: statusLabel })}
      </p>

      {reviewStatus === "REJECTED" && adminNote ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 whitespace-pre-wrap">
          <p className="font-semibold">{t("identityRejectionReason")}</p>
          <p className="mt-1">{adminNote}</p>
        </div>
      ) : null}

      {sides.map(({ id, label }) => {
        const review = documentReviews[id];
        const rejected = review?.status === "REJECTED";
        const approved = review?.status === "APPROVED";

        return (
          <div key={id} className="space-y-1.5">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-kumbu-border bg-kumbu-surface px-4 py-3">
              <span className="text-sm font-semibold">{label}</span>
              <span className="flex items-center gap-2 text-xs font-bold text-kumbu-primary">
                {approved ? (
                  <span className="text-emerald-600">{t("identityDocApproved")}</span>
                ) : rejected ? (
                  <span className="text-red-600">{t("identityDocRejected")}</span>
                ) : uploaded[id] ? (
                  t("identityUploaded")
                ) : busy === id ? (
                  t("identityUploading")
                ) : (
                  <>
                    <Upload className="size-4" />
                    {t("identityUpload")}
                  </>
                )}
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={busy !== null || submitting || reviewStatus === "APPROVED"}
                onChange={(e) => void handleFile(id, e.target.files?.[0] ?? null)}
              />
            </label>
            {rejected && review?.rejection_reason ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {review.rejection_reason}
              </p>
            ) : null}
          </div>
        );
      })}

      {hasRejectedDocs ? (
        <p className="text-xs text-red-700">{t("identityReplaceRejected")}</p>
      ) : null}

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {message && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>
      )}
      <Button
        type="button"
        fullWidth
        className="h-11"
        disabled={!canSubmit}
        onClick={() => void handleSubmit()}
      >
        {submitting ? t("identitySubmitting") : t("identitySubmit")}
      </Button>
    </div>
  );
}
