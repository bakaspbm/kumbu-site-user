"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function OrderC2cHint({ role }: { role: "buyer" | "seller" }) {
  const t = useTranslations("orders.c2c");

  return (
    <div className="mt-4 space-y-2 rounded-xl bg-kumbu-secondary px-4 py-3 text-sm text-kumbu-muted">
      <p>
        {role === "buyer" ? (
          t.rich("buyer", {
            strong: (chunks) => <strong className="text-kumbu-foreground">{chunks}</strong>,
          })
        ) : (
          t.rich("seller", {
            strong: (chunks) => <strong className="text-kumbu-foreground">{chunks}</strong>,
          })
        )}
      </p>
      <p className="text-xs">
        <Link href="/mensagens" className="font-semibold text-kumbu-primary hover:underline">
          {t("openMessages")}
        </Link>{" "}
        {t("combineDetails")}
      </p>
    </div>
  );
}
