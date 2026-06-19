"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getSentryDsn } from "@/lib/monitoring/sentry-init";

export function SentryUserBridge() {
  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!getSentryDsn()) return;
    if (isLoggedIn && user) {
      Sentry.setUser({
        id: user.id,
        email: user.email ?? undefined,
        username: user.displayName ?? undefined,
      });
      return;
    }
    Sentry.setUser(null);
  }, [isLoggedIn, user]);

  return null;
}
