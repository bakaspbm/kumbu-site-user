"use client";

import { Briefcase, MapPin } from "lucide-react";
import {
  useJobContractLabel,
  useJobSalaryLabel,
  useJobSectorLabel,
} from "@/lib/i18n/use-job-labels";
import type { CatalogProduct } from "@/types/store";
import type { JobMeta } from "@/types/job";

export function JobDetailPanel({
  product,
  meta,
}: {
  product: CatalogProduct;
  meta: JobMeta;
}) {
  const contractLabel = useJobContractLabel();
  const sectorLabel = useJobSectorLabel();
  const salaryLabel = useJobSalaryLabel();

  return (
    <aside className="kumbu-card space-y-3 p-5">
      <span className="inline-flex items-center gap-1 rounded-full bg-kumbu-primary-soft px-3 py-1 text-xs font-bold text-kumbu-primary">
        <Briefcase className="size-3.5" />
        {contractLabel(meta.contractType)}
      </span>
      {meta.sector && (
        <p className="text-sm font-semibold text-kumbu-foreground">
          {sectorLabel(meta.sector)}
        </p>
      )}
      <p className="inline-flex items-center gap-1.5 text-sm text-kumbu-muted">
        <MapPin className="size-4" />
        {[meta.municipality, meta.province].filter(Boolean).join(", ") ||
          product.deliveryText}
      </p>
      <p className="text-sm font-bold text-kumbu-primary">{salaryLabel(meta)}</p>
      {meta.remote && (
        <p className="text-xs font-semibold text-kumbu-muted">Remoto possível</p>
      )}
      {meta.requirements && (
        <div>
          <p className="text-xs font-bold uppercase text-kumbu-muted">Requisitos</p>
          <p className="mt-1 text-sm text-kumbu-muted">{meta.requirements}</p>
        </div>
      )}
    </aside>
  );
}
