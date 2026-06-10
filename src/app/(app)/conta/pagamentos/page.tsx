"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { ContaPageHeader } from "@/components/account/conta-page-header";
import { ContaPanel } from "@/components/account/conta-section";

const MyMonetizationPaymentsPanel = dynamic(
  () =>
    import("@/components/monetization/my-payments-panel").then((m) => ({
      default: m.MyMonetizationPaymentsPanel,
    })),
  {
    ssr: false,
    loading: () => <PaymentsLoading />,
  },
);

function PaymentsLoading() {
  const t = useTranslations("accountPages.payments");
  return <p className="py-8 text-center text-sm text-kumbu-muted">{t("loading")}</p>;
}

export default function ContaPagamentosPage() {
  const t = useTranslations("accountPages.payments");

  return (
    <ContaPanel>
      <ContaPageHeader
        icon={Sparkles}
        title={t("title")}
        description={t("description")}
      />
      <MyMonetizationPaymentsPanel />
    </ContaPanel>
  );
}
