"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportAccountDataPrettyJson } from "@/lib/site-data";

export function AccountExport() {
  const t = useTranslations("settings");
  const tErrors = useTranslations("errors");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setError(null);
    setLoading(true);
    try {
      const json = await exportAccountDataPrettyJson();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kumbu-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : tErrors("exportError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-kumbu-muted">{t("exportDescription")}</p>
      {error && (
        <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <Button
        type="button"
        variant="secondary"
        className="mt-4 h-11 gap-2"
        disabled={loading}
        onClick={() => void handleExport()}
      >
        <Download className="size-4" />
        {loading ? t("exportPreparing") : t("exportJson")}
      </Button>
    </div>
  );
}
