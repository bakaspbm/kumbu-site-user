"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoadingIndicator } from "@/components/ui/page-loading-indicator";
import { ListingCard } from "@/components/store/listing-card";
import { listMyCvs, matchJobsForCv } from "@/lib/site-data";
import { useAuth } from "@/contexts/auth-context";
import type { JobMatch, UserCv } from "@/types/job";

export function CvJobMatches() {
  const t = useTranslations("jobs.cvMatches");
  const tJobs = useTranslations("jobs");
  const { user } = useAuth();

  const [cvs, setCvs] = useState<UserCv[]>([]);
  const [cvId, setCvId] = useState("");
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    void listMyCvs()
      .then((rows) => {
        setCvs(rows);
        if (rows[0]) setCvId(rows[0].id);
      })
      .catch(() => setCvs([]));
  }, [user?.id]);

  const loadMatches = useCallback(async () => {
    if (!cvId) return;
    setLoading(true);
    setError(null);
    setLoaded(true);
    try {
      setMatches(await matchJobsForCv(cvId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadError"));
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [cvId, t]);

  function reasonLabel(key: string) {
    return t(`reasons.${key}` as "reasons.sector");
  }

  if (!user) {
    return (
      <div className="kumbu-card mt-4 space-y-3 p-4">
        <h2 className="flex items-center gap-2 font-bold">
          <Sparkles className="size-4 text-kumbu-primary" />
          {t("title")}
        </h2>
        <p className="text-sm text-kumbu-muted">{t("loginRequired")}</p>
        <Button href="/login" fullWidth>
          {tJobs("apply.loginRequired")}
        </Button>
      </div>
    );
  }

  if (cvs.length === 0) {
    return (
      <div className="kumbu-card mt-4 space-y-3 p-4">
        <h2 className="flex items-center gap-2 font-bold">
          <Sparkles className="size-4 text-kumbu-primary" />
          {t("title")}
        </h2>
        <p className="text-sm text-kumbu-muted">{t("noCv")}</p>
        <Button href="/conta/curriculos" variant="secondary" fullWidth>
          {t("createCv")}
        </Button>
      </div>
    );
  }

  return (
    <div id="cv-matches" className="kumbu-card mt-4 scroll-mt-20 space-y-3 p-4">
      <h2 className="flex items-center gap-2 font-bold">
        <Sparkles className="size-4 text-kumbu-primary" />
        {t("title")}
      </h2>
      <p className="text-sm text-kumbu-muted">{t("description")}</p>

      <label className="flex flex-col gap-1 text-xs font-semibold">
        {t("cvLabel")}
        <select
          value={cvId}
          onChange={(e) => setCvId(e.target.value)}
          className="kumbu-input font-normal"
        >
          {cvs.map((cv) => (
            <option key={cv.id} value={cv.id}>
              {cv.title} — {cv.fullName}
            </option>
          ))}
        </select>
      </label>

      <Button type="button" fullWidth onClick={() => void loadMatches()} disabled={loading || !cvId}>
        {loading ? t("loading") : t("findJobs")}
      </Button>

      {error && (
        <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <PageLoadingIndicator label={t("loading")} />
      ) : loaded && matches.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={t("noMatchesTitle")}
          description={t("noMatches")}
          className="py-6"
        />
      ) : (
        <ul className="space-y-3">
          {matches.map((match) => (
            <li key={match.job.id} className="rounded-xl border border-kumbu-border p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-kumbu-primary/10 px-2 py-0.5 text-xs font-bold text-kumbu-primary">
                  {match.matchScore}% {t("match")}
                </span>
                {match.alreadyApplied && (
                  <span className="text-xs font-semibold text-emerald-700">{t("alreadyApplied")}</span>
                )}
              </div>
              {match.matchReasons.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
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
              <ListingCard product={match.job} variant="list" />
              <Link
                href={`/produto/${match.job.id}`}
                className="mt-2 inline-block text-xs font-semibold text-kumbu-primary"
              >
                {t("viewJob")}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
