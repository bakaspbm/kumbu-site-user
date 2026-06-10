"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { ContaPageHeader } from "@/components/account/conta-page-header";
import { ContaPanel } from "@/components/account/conta-section";
import { ContaSegmentedTabs } from "@/components/account/conta-segmented-tabs";
import { RentalRequestsManager } from "@/components/property/rental-requests-manager";

export default function ReservasPage() {
  const searchParams = useSearchParams();
  const t = useTranslations("account");
  const [tab, setTab] = useState<"renter" | "owner">("renter");

  const tabOptions = useMemo(
    () => [
      { value: "renter" as const, label: t("rentalsMyRequests") },
      { value: "owner" as const, label: t("rentalsReceived") },
    ],
    [t],
  );

  useEffect(() => {
    if (searchParams.get("tab") === "owner") setTab("owner");
  }, [searchParams]);

  return (
    <ContaPanel>
      <ContaPageHeader
        icon={MapPin}
        title={t("rentalsTitle")}
        description={t("rentalsDescription")}
      />
      <ContaSegmentedTabs value={tab} onChange={setTab} options={tabOptions} />
      <RentalRequestsManager mode={tab} />
    </ContaPanel>
  );
}
