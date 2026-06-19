"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, Download, Eye, MessageCircle, X, Briefcase, Users } from "lucide-react";
import { loadEmployerJobsDataAction } from "@/app/actions/jobs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoadingIndicator } from "@/components/ui/page-loading-indicator";
import { isJobListing } from "@/lib/jobs/category";
import { promiseWithTimeout } from "@/lib/promise-timeout";
import { ANGOLA_PROVINCES } from "@/lib/property/constants";
import {
  listApplicationsForJob,
  listEmployerJobApplications,
  listMyListings,
  markJobAsFilled,
  recordJobApplicationCvView,
  respondJobApplication,
} from "@/lib/site-data";
import { useAuth } from "@/contexts/auth-context";
import { CvDetailModal } from "@/components/jobs/cv-detail-modal";
import { CvDetailPreview } from "@/components/jobs/cv-detail-preview";
import { downloadCvPdf } from "@/lib/cv/generate-cv-pdf";
import type { CatalogProduct } from "@/types/store";
import type { JobApplication, JobApplicationStatus } from "@/types/job";

export function EmployerApplicationsManager() {
  const t = useTranslations("jobs.applications");
  const tJobs = useTranslations("jobs");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [detailApp, setDetailApp] = useState<JobApplication | null>(null);
  const jobInitRef = useRef(false);

  const [jobs, setJobs] = useState<CatalogProduct[]>([]);
  const [jobId, setJobId] = useState("");
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [province, setProvince] = useState("");
  const [status, setStatus] = useState<JobApplicationStatus | "">("");
  const [q, setQ] = useState("");

  const loadAll = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setApps([]);
      return;
    }

    setLoading(true);
    setAppsLoading(true);
    setError(null);

    const filters = {
      province: province || undefined,
      status: status || undefined,
      q: q || undefined,
    };

    try {
      const all = await promiseWithTimeout(
        listMyListings(),
        20_000,
        t("loadJobsError"),
      );
      const mine = all.filter(isJobListing);
      setJobs(mine);

      const activeJobId = jobId || (mine[0]?.id ?? "");
      if (!jobInitRef.current && mine[0] && !jobId) {
        jobInitRef.current = true;
        setJobId(mine[0].id);
      }

      const applications = await promiseWithTimeout(
        activeJobId
          ? listApplicationsForJob(activeJobId, filters)
          : listEmployerJobApplications(filters),
        20_000,
        t("loadAppsError"),
      );
      setApps(applications);
    } catch {
      const result = await loadEmployerJobsDataAction(jobId, filters);
      if (!result.ok) {
        setError(result.error);
        setJobs([]);
        setApps([]);
        return;
      }
      setJobs(result.jobs);
      setApps(result.applications);
      if (!jobId && result.jobs[0]) setJobId(result.jobs[0].id);
    } finally {
      setLoading(false);
      setAppsLoading(false);
    }
  }, [user?.id, jobId, province, status, q, t]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    const fromUrl = searchParams.get("job")?.trim();
    if (fromUrl) setJobId(fromUrl);
  }, [searchParams]);

  async function respond(id: string, action: "accept" | "reject") {
    setBusyId(id);
    try {
      const updated = await respondJobApplication(id, action);
      setApps((prev) => prev.map((a) => (a.id === id ? updated : a)));
      if (action === "accept" && updated.conversationId) {
        router.push(`/mensagens/${updated.conversationId}`);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : tCommon("error"));
    } finally {
      setBusyId(null);
    }
  }

  function markCvViewed(applicationId: string) {
    const viewedAt = new Date().toISOString();
    setApps((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, cvViewedAt: viewedAt } : a)),
    );
    setDetailApp((prev) =>
      prev?.id === applicationId ? { ...prev, cvViewedAt: viewedAt } : prev,
    );
  }

  async function fillJob() {
    if (!jobId || !user?.id || !confirm(t("markFilledConfirm"))) {
      return;
    }
    await markJobAsFilled(jobId, user.id);
    await loadAll();
  }

  const showSpinner = loading || appsLoading;

  return (
    <div className="mt-4 space-y-4">
      <div className="kumbu-card space-y-3 p-4">
        <h3 className="font-bold">{t("filters")}</h3>
        <label className="flex flex-col gap-1 text-xs font-semibold">
          {t("jobLabel")}
          <select
            value={jobId}
            onChange={(e) => {
              jobInitRef.current = true;
              setJobId(e.target.value);
            }}
            className="kumbu-input font-normal"
            disabled={loading}
          >
            <option value="">{t("allJobs")}</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
                {j.jobListingStatus !== "active" ? t("inactiveSuffix") : ""}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="kumbu-input text-sm"
          >
            <option value="">{tJobs("allProvinces")}</option>
            {ANGOLA_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as JobApplicationStatus | "")}
            className="kumbu-input text-sm"
          >
            <option value="">{t("allStatuses")}</option>
            <option value="pending">{t("statusPending")}</option>
            <option value="accepted">{t("statusAccepted")}</option>
            <option value="rejected">{t("statusRejected")}</option>
          </select>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="kumbu-input text-sm"
        />
        {jobId && (
          <Button type="button" variant="secondary" fullWidth onClick={() => void fillJob()}>
            {t("markFilled")}
          </Button>
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {showSpinner ? (
        <PageLoadingIndicator label={t("loading")} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={t("noJobsTitle")}
          description={t("noJobs")}
          actionLabel={t("noJobsAction")}
          actionHref="/publicar"
          className="py-10"
        />
      ) : apps.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t("noAppsTitle")}
          description={t("noApps")}
          className="py-10"
        />
      ) : (
        <ul className="kumbu-card-grid">
            {apps.map((a) => (
              <li key={a.id} className="kumbu-card p-4">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="font-bold text-kumbu-primary">
                      {a.cvSnapshot?.fullName ?? a.applicantName ?? t("applicant")}
                    </p>
                    <p className="text-xs text-kumbu-muted">
                      {t("cvLabel")}: {a.cvSnapshot?.title ?? "—"}
                      {a.cvSnapshot?.profession ? ` · ${a.cvSnapshot.profession}` : ""} ·{" "}
                      {t(`status.${a.status}`)}
                      {a.cvViewedAt ? ` · ${t("cvViewed")}` : ""}
                    </p>
                  </div>
                </div>
                {a.cvSnapshot && (
                  <div className="mt-2">
                    <CvDetailPreview cv={a.cvSnapshot} compact />
                  </div>
                )}
                {a.jobTitle && (
                  <Link
                    href={`/produto/${a.jobId}`}
                    className="mt-2 inline-block text-xs font-semibold text-kumbu-primary"
                  >
                    {a.jobTitle}
                  </Link>
                )}
                {a.coverMessage && (
                  <p className="mt-1 text-sm italic text-kumbu-muted">
                    &ldquo;{a.coverMessage}&rdquo;
                  </p>
                )}
                <p className="mt-1 text-xs text-kumbu-muted">
                  {[a.cvSnapshot?.city, a.cvSnapshot?.province].filter(Boolean).join(", ")}
                  {a.cvSnapshot?.phone ? ` · ${a.cvSnapshot.phone}` : ""}
                </p>
                {a.cvSnapshot && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-10 flex-1 gap-1"
                      onClick={() => setDetailApp(a)}
                    >
                      <Eye className="size-4" />
                      {t("viewFullCv")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 flex-1 gap-1"
                      onClick={() => {
                        void downloadCvPdf(a.cvSnapshot!);
                        void recordJobApplicationCvView(a.id)
                          .then(() => markCvViewed(a.id))
                          .catch(() => {});
                      }}
                    >
                      <Download className="size-4" />
                      {t("downloadPdf")}
                    </Button>
                  </div>
                )}
                {a.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    className="h-10 flex-1 gap-1"
                    disabled={busyId === a.id}
                    onClick={() => void respond(a.id, "accept")}
                  >
                    <Check className="size-4" />
                    {t("accept")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 flex-1 gap-1 border-red-200 text-red-700"
                    disabled={busyId === a.id}
                    onClick={() => void respond(a.id, "reject")}
                  >
                    <X className="size-4" />
                    {t("reject")}
                  </Button>
                </div>
              )}
              {a.conversationId && (
                <Button
                  href={`/mensagens/${a.conversationId}`}
                  variant="secondary"
                  fullWidth
                  className="mt-2 h-10 gap-2"
                >
                  <MessageCircle className="size-4" />
                  {t("chat")}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {detailApp && (
        <CvDetailModal
          application={detailApp}
          onClose={() => setDetailApp(null)}
          onViewRecorded={markCvViewed}
        />
      )}
    </div>
  );
}
