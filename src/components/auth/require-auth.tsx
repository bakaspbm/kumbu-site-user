"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/auth-context";
import { hasClientSession } from "@/lib/auth/complete-auth";
import { clearClientSessionMarkers } from "@/lib/kumbu-api/session-tokens";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Button } from "@/components/ui/button";

const RESTORE_GIVE_UP_MS = 12_000;

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const { isLoggedIn, isLoading, refresh } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || "/conta/perfil";
  const recheckStartedRef = useRef(false);
  const [restoreFailed, setRestoreFailed] = useState(false);
  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  const restoring = !isLoading && !isLoggedIn && hasClientSession();

  useEffect(() => {
    if (isLoading || isLoggedIn) {
      recheckStartedRef.current = false;
      setRestoreFailed(false);
      return;
    }

    if (hasClientSession()) {
      if (!recheckStartedRef.current) {
        recheckStartedRef.current = true;
        void refresh();
      }
      return;
    }

    router.replace(loginHref);
  }, [isLoading, isLoggedIn, router, refresh, loginHref]);

  useEffect(() => {
    if (!restoring || restoreFailed) return;

    const timer = window.setTimeout(() => {
      clearClientSessionMarkers();
      setRestoreFailed(true);
      router.replace(loginHref);
    }, RESTORE_GIVE_UP_MS);

    return () => window.clearTimeout(timer);
  }, [restoring, restoreFailed, router, loginHref]);

  if (restoreFailed && !isLoggedIn) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-sm text-sm text-kumbu-muted">{t("restoreFailed")}</p>
        <Button href={loginHref}>{t("signInAgain")}</Button>
      </div>
    );
  }

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
