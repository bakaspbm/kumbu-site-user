"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { SiteHeader } from "@/components/layout/site-header";
import { ListingCard } from "@/components/store/listing-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoadingIndicator } from "@/components/ui/page-loading-indicator";
import { AngolaProvinceMunicipalityFields } from "@/components/geo/angola-province-municipality-fields";
import {
  useJobContractLabel,
  useJobContractTypes,
  useJobSectorLabel,
  useJobSectors,
} from "@/lib/i18n/use-job-labels";
import { listActiveJobs } from "@/lib/site-data";
import type { JobContractType, JobListFilters } from "@/types/job";
import type { CatalogProduct } from "@/types/store";

export default function EmpregoPage() {
  const t = useTranslations("jobs");
  const tCommon = useTranslations("common");
  const tAccount = useTranslations("account");
  const contractLabel = useJobContractLabel();
  const sectorLabel = useJobSectorLabel();
  const contractTypes = useJobContractTypes();
  const sectors = useJobSectors();
  const [jobs, setJobs] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [province, setProvince] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [contractType, setContractType] = useState<JobContractType | "">("");
  const [sector, setSector] = useState("");
  const [remote, setRemote] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    void (async () => {
      const filters: JobListFilters = {
        province: province || undefined,
        municipality: municipality || undefined,
        contractType: contractType || undefined,
        sector: sector || undefined,
        remote: remote || undefined,
        q: q || undefined,
      };
      try {
        setJobs(await listActiveJobs(filters));
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [province, municipality, contractType, sector, remote, q]);

  return (
    <article className="min-h-full pb-10">
      <SiteHeader subtitle={t("title")} showSearch={false} />
      <div className="kumbu-container max-w-6xl py-4">
        <p className="text-sm text-kumbu-muted">{t("description")}</p>

        <div className="kumbu-card mt-4 space-y-3 p-4">
          <h2 className="flex items-center gap-2 font-bold">
            <Search className="size-4 text-kumbu-primary" />
            {t("filters")}
          </h2>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="kumbu-input text-sm"
          />
          <AngolaProvinceMunicipalityFields
            province={province}
            municipality={municipality}
            onProvinceChange={setProvince}
            onMunicipalityChange={setMunicipality}
            allowEmptyProvince
            allowEmptyMunicipality
            provinceRequired={false}
            municipalityRequired={false}
            provincePlaceholder={t("allProvinces")}
            municipalityPlaceholder={t("allMunicipalities")}
            gridClassName="grid grid-cols-1 gap-2 sm:grid-cols-2"
            selectClassName="kumbu-input text-sm"
          />
          <select
            value={contractType}
            onChange={(e) => setContractType(e.target.value as JobContractType | "")}
            className="kumbu-input text-sm"
          >
            <option value="">{t("contractType")}</option>
            {contractTypes.map((k) => (
              <option key={k} value={k}>
                {contractLabel(k)}
              </option>
            ))}
          </select>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="kumbu-input text-sm"
          >
            <option value="">{t("sector")}</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {sectorLabel(s)}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={remote}
              onChange={(e) => setRemote(e.target.checked)}
            />
            {t("remoteOnly")}
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/conta/cvs"
            className="rounded-full bg-kumbu-secondary px-4 py-2 text-xs font-bold text-kumbu-primary"
          >
            {tAccount("myCvs")}
          </Link>
          <Link
            href="/publicar"
            className="rounded-full bg-kumbu-primary px-4 py-2 text-xs font-bold text-white"
          >
            {t("publishJob")}
          </Link>
        </div>

        {loading ? (
          <PageLoadingIndicator label={tCommon("loading")} className="mt-8" />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Search}
            title={t("noActiveJobsTitle")}
            description={t("noActiveJobs")}
            actionLabel={t("publishJob")}
            actionHref="/publicar"
            className="mt-8 py-10"
          />
        ) : (
          <ul className="kumbu-listing-grid mt-6">
            {jobs.map((j) => (
              <li key={j.id}>
                <ListingCard product={j} variant="grid" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
