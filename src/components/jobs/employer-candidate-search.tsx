"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircle, Search, UserSearch } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoadingIndicator } from "@/components/ui/page-loading-indicator";
import { CvBrowseModal } from "@/components/jobs/cv-browse-modal";
import { CvDetailPreview } from "@/components/jobs/cv-detail-preview";
import { useJobSectorLabel, useJobSectors } from "@/lib/i18n/use-job-labels";
import { ANGOLA_PROVINCES } from "@/lib/property/constants";
import { listMyListings, searchCandidates, contactJobCandidate } from "@/lib/site-data";
import { isJobListing } from "@/lib/jobs/category";
import { useAuth } from "@/contexts/auth-context";
import type { CatalogProduct } from "@/types/store";
import type { CandidateMatch } from "@/types/job";

function MatchBadge({ score }: { score: number }) {
  return (
    <span className="rounded-full bg-kumbu-primary/10 px-2 py-0.5 text-xs font-bold text-kumbu-primary">
      {score}%
    </span>
  );
}

export function EmployerCandidateSearch({
  initialJobId = "",
  embedded = false,
}: {
  initialJobId?: string;
  embedded?: boolean;
}) {
  const t = useTranslations("jobs.candidateSearch");
  const tJobs = useTranslations("jobs");
  const tCommon = useTranslations("common");
  const sectorLabel = useJobSectorLabel();
  const sectors = useJobSectors();
  const { user } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<CatalogProduct[]>([]);
  const [jobId, setJobId] = useState(initialJobId);
  const [q, setQ] = useState("");
  const [profession, setProfession] = useState("");
  const [province, setProvince] = useState("");
  const [results, setResults] = useState<CandidateMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailCv, setDetailCv] = useState<CandidateMatch | null>(null);
  const [contactCvId, setContactCvId] = useState<string | null>(null);
  const [contactMessage, setContactMessage] = useState("");
  const [contactBusy, setContactBusy] = useState(false);
  const [contactToast, setContactToast] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    void listMyListings()
      .then((all) => setJobs(all.filter(isJobListing)))
      .catch(() => setJobs([]));
  }, [user?.id]);

  useEffect(() => {
    if (initialJobId) setJobId(initialJobId);
  }, [initialJobId]);

  const runSearch = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const rows = await searchCandidates({
        q: q.trim() || undefined,
        profession: profession || undefined,
        province: province || undefined,
        jobId: jobId || undefined,
      });
      setResults(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : tJobs("applications.loadAppsError"));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, q, profession, province, jobId, tJobs]);

  function reasonLabel(key: string) {
    return t(`reasons.${key}` as "reasons.sector");
  }

  async function sendContact(cvId: string, openChat = true) {
    if (!jobId) {
      setContactToast(t("selectJobFirst"));
      return;
    }
    setContactBusy(true);
    setContactToast(null);
    try {
      const app = await contactJobCandidate(jobId, cvId, contactMessage);
      setContactCvId(null);
      setContactMessage("");
      setContactToast(t("contactSuccess"));
      setResults((prev) =>
        prev.map((row) =>
          row.cv.id === cvId
            ? {
                ...row,
                applicationStatus: app.status,
                canContact: false,
                alreadyApplied: true,
              }
            : row,
        ),
      );
      if (openChat && app.conversationId && app.status === "invited") {
        router.push(`/mensagens/${app.conversationId}`);
      }
    } catch (err) {
      setContactToast(err instanceof Error ? err.message : tCommon("error"));
    } finally {
      setContactBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="kumbu-card space-y-3 p-4">
        {!embedded && (
          <>
            <h3 className="flex items-center gap-2 font-bold">
              <UserSearch className="size-4 text-kumbu-primary" />
              {t("title")}
            </h3>
            <p className="text-sm text-kumbu-muted">{t("description")}</p>
          </>
        )}

        <label className="flex flex-col gap-1 text-xs font-semibold">
          {t("jobLabel")}
          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="kumbu-input font-normal"
          >
            <option value="">{t("allCandidates")}</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </label>
        {jobId && (
          <p className="text-xs text-kumbu-muted">{t("jobMatchHint")}</p>
        )}

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="kumbu-input text-sm"
        />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <select
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="kumbu-input text-sm"
            disabled={Boolean(jobId)}
          >
            <option value="">{tJobs("sector")}</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {sectorLabel(s)}
              </option>
            ))}
          </select>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="kumbu-input text-sm"
            disabled={Boolean(jobId)}
          >
            <option value="">{tJobs("allProvinces")}</option>
            {ANGOLA_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <Button type="button" fullWidth onClick={() => void runSearch()} disabled={loading}>
          <Search className="mr-2 size-4" />
          {loading ? t("searching") : t("search")}
        </Button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <PageLoadingIndicator label={t("searching")} />
      ) : searched && results.length === 0 ? (
        <EmptyState
          icon={UserSearch}
          title={t("noResultsTitle")}
          description={t("noResults")}
          className="py-10"
        />
      ) : (
        <ul className="kumbu-card-grid">
          {results.map((match) => (
            <li key={match.cv.id} className="kumbu-card space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-kumbu-primary">{match.cv.fullName}</p>
                  <p className="text-xs text-kumbu-muted">
                    {match.cv.title}
                    {match.cv.profession ? ` · ${sectorLabel(match.cv.profession)}` : ""}
                  </p>
                </div>
                <MatchBadge score={match.matchScore} />
              </div>

              {match.matchReasons.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {match.matchReasons.map((reason) => (
                    <span
                      key={reason}
                      className="rounded-full bg-kumbu-secondary px-2 py-0.5 text-[10px] font-semibold text-kumbu-primary"
                    >
                      {reasonLabel(reason)}
                    </span>
                  ))}
                </div>
              )}

              {match.alreadyApplied && match.applicationStatus === "pending" && (
                <p className="text-xs font-semibold text-amber-700">{t("alreadyApplied")}</p>
              )}
              {match.applicationStatus === "invited" && (
                <p className="text-xs font-semibold text-emerald-700">{t("alreadyContacted")}</p>
              )}
              {match.applicationStatus === "accepted" && (
                <p className="text-xs font-semibold text-emerald-700">{t("alreadyAccepted")}</p>
              )}
              {match.applicationStatus === "rejected" && match.canContact && (
                <p className="text-xs font-semibold text-kumbu-muted">{t("rejectedCanContact")}</p>
              )}

              <CvDetailPreview cv={match.cv} compact />

              <div className="flex flex-col gap-2">
                <Button type="button" variant="secondary" fullWidth onClick={() => setDetailCv(match)}>
                  {t("viewCv")}
                </Button>
                {jobId && match.canContact && (
                  <Button
                    type="button"
                    fullWidth
                    className="gap-2"
                    onClick={() => {
                      setContactCvId(match.cv.id);
                      setContactMessage("");
                    }}
                  >
                    <MessageCircle className="size-4" />
                    {t("contactCandidate")}
                  </Button>
                )}
                {jobId && match.applicationStatus === "pending" && (
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    disabled={contactBusy}
                    onClick={() => void sendContact(match.cv.id, false)}
                  >
                    {t("notifyInterest")}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {detailCv && (
        <CvBrowseModal cv={detailCv.cv} onClose={() => setDetailCv(null)} />
      )}

      {contactCvId && (
        <div className="kumbu-card space-y-3 p-4">
          <h3 className="font-bold">{t("contactTitle")}</h3>
          <p className="text-sm text-kumbu-muted">{t("contactDescription")}</p>
          <textarea
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            placeholder={t("contactMessagePlaceholder")}
            className="kumbu-input min-h-[88px] text-sm"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setContactCvId(null)}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              className="flex-1 gap-2"
              disabled={contactBusy}
              onClick={() => void sendContact(contactCvId)}
            >
              <MessageCircle className="size-4" />
              {contactBusy ? t("contacting") : t("sendContact")}
            </Button>
          </div>
        </div>
      )}

      {contactToast && (
        <p className="rounded-xl bg-kumbu-secondary px-3 py-2 text-sm text-kumbu-muted">{contactToast}</p>
      )}
    </div>
  );
}
