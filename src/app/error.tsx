"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useResolveUserFacingError } from "@/lib/i18n/use-format-error";
import { Button } from "@/components/ui/button";
import { UserFacingErrorAlert } from "@/components/ui/user-facing-error-alert";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  const resolveError = useResolveUserFacingError();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const facing = resolveError(error);

  return (
    <div className="kumbu-page-bg flex min-h-screen flex-col items-center justify-center px-6">
      <div className="kumbu-card max-w-md p-8">
        <UserFacingErrorAlert
          error={facing}
          onRetry={() => reset()}
          retryLabel={t("errorPageRetry")}
        />
        <div className="mt-4">
          <Button href="/" variant="secondary" fullWidth>
            {t("errorPageGoHome")}
          </Button>
        </div>
      </div>
    </div>
  );
}
