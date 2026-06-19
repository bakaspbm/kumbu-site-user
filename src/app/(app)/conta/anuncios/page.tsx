"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus, Tag } from "lucide-react";
import { ContaPageHeader } from "@/components/account/conta-page-header";
import { ContaPanel } from "@/components/account/conta-section";
import { Button } from "@/components/ui/button";
import { PageLoadingIndicator } from "@/components/ui/page-loading-indicator";

const MyListingsManager = dynamic(
  () =>
    import("@/components/listings/my-listings-manager").then((m) => ({
      default: m.MyListingsManager,
    })),
  {
    ssr: false,
    loading: () => <ListingsLoading />,
  },
);

function ListingsLoading() {
  const t = useTranslations("accountPages.listings");
  return <PageLoadingIndicator label={t("loading")} />;
}

export default function ContaAnunciosPage() {
  const t = useTranslations("accountPages.listings");
  return (
    <ContaPanel>
      <ContaPageHeader
        icon={Tag}
        title={t("title")}
        description={t("description")}
        action={
          <Button href="/publicar" className="h-10 shrink-0 px-4">
            <Plus className="size-4" />
            {t("publish")}
          </Button>
        }
      />
      <MyListingsManager />
      <p className="text-center text-sm text-kumbu-muted">
        <Link href="/publicar" className="font-semibold text-kumbu-primary hover:underline">
          {t("createNew")}
        </Link>
      </p>
    </ContaPanel>
  );
}
