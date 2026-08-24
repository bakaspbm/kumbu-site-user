"use client";

import { use, useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { RequireAuth } from "@/components/auth/require-auth";
import { NotificationDetailView } from "@/components/notifications/notification-detail-view";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoadingIndicator } from "@/components/ui/page-loading-indicator";
import { UserFacingErrorAlert } from "@/components/ui/user-facing-error-alert";
import { useResolveUserFacingError } from "@/lib/i18n/use-format-error";
import { getNotificationBackend } from "@/lib/kumbu-api/notifications";
import { withBrowserAuthRetry } from "@/lib/kumbu-api/with-browser-auth";
import type { UserNotification } from "@/types/store";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function NotificacaoDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");
  const resolveError = useResolveUserFacingError();
  const [notification, setNotification] = useState<UserNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ReturnType<typeof resolveError> | null>(null);
  const [missing, setMissing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMissing(false);
    try {
      const row = await withBrowserAuthRetry(() => getNotificationBackend(id));
      if (!row) {
        setMissing(true);
        setNotification(null);
        return;
      }
      setNotification(row);
    } catch (err) {
      setError(resolveError(err));
      setNotification(null);
    } finally {
      setLoading(false);
    }
  }, [id, resolveError]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <RequireAuth>
      {loading ? (
        <PageLoadingIndicator label={tCommon("loading")} />
      ) : error ? (
        <div className="mt-8">
          <UserFacingErrorAlert
            error={error}
            onRetry={() => void load()}
            retryLabel={tCommon("retry")}
          />
        </div>
      ) : missing || !notification ? (
        <EmptyState
          className="mt-8"
          icon={Bell}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          actionLabel={t("emptyAction")}
          actionHref="/conta/notificacoes"
        />
      ) : (
        <NotificationDetailView notification={notification} />
      )}
    </RequireAuth>
  );
}
