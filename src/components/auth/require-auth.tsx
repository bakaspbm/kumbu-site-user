"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/auth-context";
import { getBackendSession } from "@/lib/kumbu-api/auth";
import { hasBrowserSession } from "@/lib/auth/complete-auth";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const { isLoggedIn, isLoading, refresh } = useAuth();
  const router = useRouter();
  const recheckStartedRef = useRef(false);

  useEffect(() => {
    if (isLoading || isLoggedIn) {
      recheckStartedRef.current = false;
      return;
    }

    if (hasBrowserSession() || getBackendSession()?.accessToken) {
      if (!recheckStartedRef.current) {
        recheckStartedRef.current = true;
        void refresh();
      }
      return;
    }

    router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  }, [isLoading, isLoggedIn, router, refresh]);

  const restoring = !isLoading && !isLoggedIn && (hasBrowserSession() || Boolean(getBackendSession()?.accessToken));

  if (isLoading || restoring) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <LoadingIndicator
          active
          label={restoring ? t("restoringSession") : t("loading")}
          slowHint={tCommon("loadingSlowHint")}
          className="max-w-sm"
          compact
        />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return <>{children}</>;
}
