"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, FileText, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  applyToJob,
  getMyApplicationForJob,
  listMyCvs,
} from "@/lib/site-data";
import { useAuth } from "@/contexts/auth-context";
import type { CatalogProduct } from "@/types/store";
import type { JobApplication, UserCv } from "@/types/job";

interface JobApplyPanelProps {
  job: CatalogProduct;
}

export function JobApplyPanel({ job }: JobApplyPanelProps) {
  const t = useTranslations("jobs.applyPanel");
  const tCommon = useTranslations("common");
  const { isLoggedIn, user } = useAuth();
  const [cvs, setCvs] = useState<UserCv[]>([]);
  const [cvId, setCvId] = useState("");
  const [message, setMessage] = useState("");
  const [existing, setExisting] = useState<JobApplication | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isOwn = user?.id === job.sellerId;
  const closed = job.jobListingStatus !== "active";

  useEffect(() => {
    if (!isLoggedIn) return;
    void (async () => {
      const [list, app] = await Promise.all([
        listMyCvs(),
        getMyApplicationForJob(job.id),
      ]);
      setCvs(list);
      setCvId(list[0]?.id ?? "");
      setExisting(app);
    })();
  }, [isLoggedIn, job.id]);

  async function submit() {
    setToast(null);
    if (!cvId) {
      setToast(t("selectCvError"));
      return;
    }
    setBusy(true);
    try {
      await applyToJob(job.id, cvId, message);
      setToast(t("success"));
      const app = await getMyApplicationForJob(job.id);
      setExisting(app);
    } catch (e) {
      setToast(e instanceof Error ? e.message : t("error"));
    } finally {
      setBusy(false);
    }
  }

  if (isOwn) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-kumbu-muted">{t("ownJob")}</p>
        <Button href="/conta/vagas-candidaturas" fullWidth className="h-12">
          {t("viewApplicants")}
        </Button>
      </div>
    );
  }

  if (closed) {
    return (
      <p className="rounded-xl bg-kumbu-secondary px-4 py-3 text-sm text-kumbu-muted">
        {t("filled")}
      </p>
    );
  }

  if (existing) {
    return (
      <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
        <p className="font-bold">{t("submitted")}</p>
        <p className="mt-1">
          {existing.status === "pending"
            ? t("statusPending")
            : existing.status === "accepted"
              ? t("statusAccepted")
              : t("statusRejected")}
        </p>
        {existing.conversationId && (
          <Button
            href={`/mensagens/${existing.conversationId}`}
            className="mt-3 h-10"
            fullWidth
          >
            {t("openChat")}
          </Button>
        )}
        <Button
          href="/conta/candidaturas"
          variant="secondary"
          fullWidth
          className="mt-2 h-10"
        >
          {t("myApplications")}
        </Button>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Button href={`/login?next=/produto/${job.id}`} fullWidth className="h-12">
        {t("loginToApply")}
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-bold">
        <Briefcase className="size-4 text-kumbu-primary" />
        {t("title")}
      </h3>

      {cvs.length === 0 ? (
        <div className="kumbu-card p-4 text-center text-sm">
          <FileText className="mx-auto size-8 text-kumbu-muted" />
          <p className="mt-2 text-kumbu-muted">{t("noCvs")}</p>
          <Button href="/conta/cvs" className="mt-3 h-10">
            {t("createCv")}
          </Button>
        </div>
      ) : (
        <>
          <label className="flex flex-col gap-1 text-xs font-semibold">
            {t("selectCv")}
            <select
              value={cvId}
              onChange={(e) => setCvId(e.target.value)}
              className="kumbu-input font-normal"
            >
              {cvs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} — {c.fullName}
                </option>
              ))}
            </select>
          </label>
          <Link
            href="/conta/cvs"
            className="text-xs font-bold text-kumbu-primary hover:underline"
          >
            {t("manageCvs")}
          </Link>
          <label className="flex flex-col gap-1 text-xs font-semibold">
            {t("messageLabel")}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="kumbu-input min-h-[72px] font-normal"
              placeholder={t("messagePlaceholder")}
            />
          </label>
          <Button
            type="button"
            fullWidth
            className="h-12"
            disabled={busy}
            onClick={() => void submit()}
          >
            <Send className="size-4" />
            {busy ? tCommon("sending") : t("submitApplication")}
          </Button>
        </>
      )}

      {toast && (
        <p className="rounded-xl bg-kumbu-secondary px-3 py-2 text-sm text-kumbu-muted">
          {toast}
        </p>
      )}
    </div>
  );
}
