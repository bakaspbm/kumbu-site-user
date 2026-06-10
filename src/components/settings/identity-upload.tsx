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
  const [reviewStatus, setReviewStatus] = useState("NOT_SUBMITTED");
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

  useEffect(() => {
    if (!isLoggedIn) return;
    void (async () => {
      try {
        const status = await getIdentityStatusBackend();
        setUploaded(status.uploaded);
        setReviewStatus(status.reviewStatus);
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
      const status = await uploadIdentityDocumentBackend(side, file);
      setUploaded(status.uploaded);
      setReviewStatus(status.reviewStatus);
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
      const status = await submitIdentityVerificationBackend();
      setUploaded(status.uploaded);
      setReviewStatus(status.reviewStatus);
      setMessage(t("identitySubmitSuccess"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("identitySubmitError"));
    } finally {
      setSubmitting(false);
    }
  }

  const complete = sides.every(({ id }) => uploaded[id]);
  const statusLabel = reviewLabels[reviewStatus] ?? reviewStatus;

  return (
    <div className="space-y-3">
      <p className="text-sm text-kumbu-muted">{t("identityIntro")}</p>
      <p className="text-xs font-semibold text-kumbu-foreground">
        {t("identityStatus", { status: statusLabel })}
      </p>
      {sides.map(({ id, label }) => (
        <label
          key={id}
          className="flex cursor-pointer items-center justify-between rounded-xl border border-kumbu-border bg-kumbu-surface px-4 py-3"
        >
          <span className="text-sm font-semibold">{label}</span>
          <span className="flex items-center gap-2 text-xs font-bold text-kumbu-primary">
            {uploaded[id] ? t("identityUploaded") : busy === id ? t("identityUploading") : (
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
            disabled={busy !== null || submitting}
            onChange={(e) => void handleFile(id, e.target.files?.[0] ?? null)}
          />
        </label>
      ))}
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
        disabled={!complete || submitting || reviewStatus === "PENDING" || reviewStatus === "APPROVED"}
        onClick={() => void handleSubmit()}
      >
        {submitting ? t("identitySubmitting") : t("identitySubmit")}
      </Button>
    </div>
  );
}
