"use client";

import { Building2, Calendar, Key, MapPin, Tag } from "lucide-react";
import { isSaleOnlyProperty } from "@/lib/property/constants";
import { usePropertyTypeLabel } from "@/lib/i18n/use-property-labels";
import { buildLocationLabel } from "@/lib/property/category";
import { propertyMetaSummary } from "@/lib/property/helpers";
import type { CatalogProduct } from "@/types/store";
import type { PropertyMeta } from "@/types/property";

interface PropertyDetailPanelProps {
  product: CatalogProduct;
  meta: PropertyMeta;
}

export function PropertyDetailPanel({ product, meta }: PropertyDetailPanelProps) {
  const propertyTypeLabel = usePropertyTypeLabel();
  const location = buildLocationLabel(meta, product.deliveryText);
  const chips = propertyMetaSummary(meta);
  const intentLabel = isSaleOnlyProperty(meta)
    ? "Venda"
    : meta.listingIntent === "sale"
      ? "Venda"
      : meta.rentPeriod === "daily"
        ? "Aluguer diário"
        : "Aluguer longo prazo";

  return (
    <aside className="kumbu-card space-y-4 p-5">
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-kumbu-primary-soft px-3 py-1 text-xs font-bold text-kumbu-primary">
          <Building2 className="size-3.5" />
          {propertyTypeLabel(meta.propertyType)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-kumbu-secondary px-3 py-1 text-xs font-bold text-kumbu-foreground">
          <Tag className="size-3.5" />
          {intentLabel}
        </span>
      </div>

      <p className="inline-flex items-center gap-1.5 text-sm text-kumbu-muted">
        <MapPin className="size-4 shrink-0" />
        {location}
      </p>

      {chips.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {chips.map((c: string) => (
            <li
              key={c}
              className="rounded-lg bg-kumbu-secondary px-2.5 py-1 text-xs font-semibold text-kumbu-muted"
            >
              {c}
            </li>
          ))}
        </ul>
      )}

      {!isSaleOnlyProperty(meta) &&
        meta.listingIntent === "rent" &&
        meta.rentPeriod === "daily" &&
        meta.minNights && (
        <p className="flex items-center gap-2 text-xs font-semibold text-kumbu-muted">
          <Calendar className="size-3.5" />
          Estadia mínima: {meta.minNights} noite(s)
        </p>
      )}

      {!isSaleOnlyProperty(meta) &&
        meta.listingIntent === "rent" &&
        meta.rentPeriod === "long_term" &&
        meta.depositMonths && (
        <p className="flex items-center gap-2 text-xs font-semibold text-kumbu-muted">
          <Key className="size-3.5" />
          Caução: {meta.depositMonths} mês(es) de renda
        </p>
      )}
    </aside>
  );
}
