import { getTranslations } from "next-intl/server";
import { MessagesPageHeader } from "@/components/layout/messages-page-header";
import { ConversationList } from "@/components/messages/conversation-list";
import { RequireAuth } from "@/components/auth/require-auth";

export default async function MensagensPage() {
  const t = await getTranslations("chat");

  return (
    <RequireAuth>
      <MessagesPageHeader title={t("messages")} />
      <ConversationList />
    </RequireAuth>
  );
}
