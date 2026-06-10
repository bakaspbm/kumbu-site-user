import { NotificationDetailView } from "@/components/notifications/notification-detail-view";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { resolveServerAuth } from "@/lib/server-page-auth";
import { getNotification } from "@/lib/site-data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NotificacaoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const t = await getTranslations("account");
  const tAuth = await getTranslations("auth");
  const auth = await resolveServerAuth();

  if (auth.status !== "logged_in") {
    return (
      <EmptyState
        className="mt-8"
        icon={Bell}
        title={t("loginRequiredTitle")}
        description={t("loginRequiredNotification")}
        actionLabel={tAuth("login")}
        actionHref={`/login?next=/conta/notificacoes/${id}`}
      />
    );
  }

  const notification = await getNotification(id).catch(() => null);
  if (!notification) notFound();

  return <NotificationDetailView notification={notification} />;
}
