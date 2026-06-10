"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useFormatErrorMessage } from "@/lib/i18n/use-format-error";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  const formatErrorMessage = useFormatErrorMessage();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const message = formatErrorMessage(error);

  return (
    <div className="kumbu-page-bg flex min-h-screen flex-col items-center justify-center px-6">
      <div className="kumbu-card max-w-md p-8 text-center">
        <h1 className="text-xl font-extrabold text-kumbu-foreground">{t("errorPageTitle")}</h1>
        <p className="mt-3 text-sm text-kumbu-muted">{message}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Button type="button" onClick={() => reset()}>
            {t("errorPageRetry")}
          </Button>
          <Button href="/" variant="secondary">
            {t("errorPageGoHome")}
          </Button>
        </div>
      </div>
    </div>
  );
}
