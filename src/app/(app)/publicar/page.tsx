import { getTranslations } from "next-intl/server";
import { BackHeader } from "@/components/layout/back-header";
import { PublishForm } from "@/components/listings/publish-form";
import { publishFallbackCategories } from "@/lib/catalog/publish-categories";
import { listCatalogCategories } from "@/lib/site-data";
import type { CatalogCategory } from "@/types/store";

export const dynamic = "force-dynamic";

async function loadPublishCategories(): Promise<CatalogCategory[]> {
  try {
    const cats = await listCatalogCategories();
    return cats.length > 0 ? cats : publishFallbackCategories;
  } catch {
    return publishFallbackCategories;
  }
}

export default async function PublicarPage() {
  const t = await getTranslations("publish");
  const initialCategories = await loadPublishCategories();

  return (
    <main className="kumbu-container max-w-2xl pb-12">
      <BackHeader title={t("title")} />
      <p className="mt-4 text-sm leading-relaxed text-kumbu-muted">{t("intro")}</p>
      <PublishForm initialCategories={initialCategories} />
    </main>
  );
}
