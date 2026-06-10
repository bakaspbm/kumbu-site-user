"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/auth-context";
import { getBackendSession } from "@/lib/kumbu-api/auth";
import { hasBrowserSession } from "@/lib/auth/complete-auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth");
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

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-kumbu-muted">{t("loading")}</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (hasBrowserSession() || getBackendSession()?.accessToken) {
      return (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-sm text-kumbu-muted">{t("restoringSession")}</p>
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
}
