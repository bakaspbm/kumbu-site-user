import { BackHeader } from "@/components/layout/back-header";
import { ChatRoom } from "@/components/messages/chat-room";
import { RequireAuth } from "@/components/auth/require-auth";
import { loadChatRoomServer } from "@/lib/chat/load-chat-room-server";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MensagemChatPage({ params }: PageProps) {
  const { id } = await params;
  const initial = await loadChatRoomServer(id);

  return (
    <RequireAuth>
      <BackHeader title="Conversa" />
      <ChatRoom
        conversationId={id}
        initialConversation={initial.conversation}
        initialMessages={initial.messages}
        initialError={initial.error}
        initialNeedsLogin={initial.needsLogin}
      />
    </RequireAuth>
  );
}
