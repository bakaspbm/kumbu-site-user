"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { localizeProductMetaEntries } from "@/lib/catalog/localize-product-fields";
import type { ProductMeta } from "@/types/product";

export function ProductAttributesPanel({ meta }: { meta: ProductMeta | null | undefined }) {
  const t = useTranslations("catalogFields");
  const entries = useMemo(() => localizeProductMetaEntries(meta, t), [meta, t]);
  if (entries.length === 0) return null;

  return (
    <aside className="kumbu-card mt-6 p-5">
      <h2 className="text-sm font-bold text-kumbu-foreground">{t("attributesPanel.title")}</h2>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        {entries.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs font-semibold uppercase text-kumbu-muted">{label}</dt>
            <dd className="text-sm font-medium text-kumbu-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
