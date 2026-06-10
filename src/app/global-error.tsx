"use client";

import { useTranslations } from "next-intl";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  const formatErrorMessage = useFormatErrorMessage();
  const message = formatErrorMessage(error);

  return (
    <html lang="pt">
      <body className="min-h-screen bg-[#f5f5f5] p-8 font-sans text-[#1d1d1d]">
        <h1 className="text-xl font-bold">{t("globalErrorTitle")}</h1>
        <p className="mt-3 text-sm text-[#6b6b6b]">{message}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-lg bg-[#d62828] px-4 py-2 text-sm font-bold text-white"
        >
          {t("errorPageRetry")}
        </button>
      </body>
    </html>
  );
}
