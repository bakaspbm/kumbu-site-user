"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { useTranslations } from "next-intl";
import { ContaPageHeader } from "@/components/account/conta-page-header";
import { ContaPanel } from "@/components/account/conta-section";
import { RequireAuth } from "@/components/auth/require-auth";
import { EmptyState } from "@/components/ui/empty-state";
import { listMyJobApplications } from "@/lib/site-data";
import type { JobApplication } from "@/types/job";

export default function CandidaturasPage() {
  const t = useTranslations("account");
  const tCommon = useTranslations("common");
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const statusLabel = useMemo(
    (): Record<string, string> => ({
      pending: t("applicationStatusPending"),
      accepted: t("applicationStatusAccepted"),
      rejected: t("applicationStatusRejected"),
    }),
    [t],
  );

  useEffect(() => {
    void (async () => {
      try {
        setApps(await listMyJobApplications());
      } catch {
        setApps([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <RequireAuth>
      <ContaPanel>
        <ContaPageHeader
          icon={Briefcase}
          title={t("applicationsTitle")}
          description={t("applicationsDescription")}
        />
        {loading ? (
          <p className="py-12 text-center text-sm text-kumbu-muted">{tCommon("loading")}</p>
        ) : apps.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={t("applicationsEmptyTitle")}
            description={t("applicationsEmptyDescription")}
            actionLabel={t("applicationsExplore")}
            actionHref="/emprego"
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {apps.map((a) => (
              <li key={a.id} className="kumbu-card-interactive p-4">
                <Link href={`/produto/${a.jobId}`} className="font-bold hover:text-kumbu-primary">
                  {a.jobTitle ?? t("applicationJobFallback")}
                </Link>
                <p className="mt-1.5 text-sm text-kumbu-muted">
                  CV: {a.cvSnapshot?.title ?? "—"} · {statusLabel[a.status] ?? a.status}
                </p>
                {a.conversationId ? (
                  <Link
                    href={`/mensagens/${a.conversationId}`}
                    className="mt-2 inline-flex text-sm font-semibold text-kumbu-primary hover:underline"
                  >
                    {t("applicationOpenChat")}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </ContaPanel>
    </RequireAuth>
  );
}
