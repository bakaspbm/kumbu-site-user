"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { setConversationDealAction } from "@/app/actions/chat-deal";
import { useDealStatusLabel } from "@/lib/chat/deal-labels";
import { ProductReviewForm } from "@/components/store/product-review-form";
import type { ConversationSummary } from "@/types/store";
import { cn } from "@/lib/utils";

interface ChatDealActionsProps {
  conversation: ConversationSummary;
  userId: string;
  onUpdated: (conv: ConversationSummary, messages?: import("@/types/store").ConversationMessage[]) => void;
  onReviewSubmitted?: () => void;
}

export function ChatDealActions({
  conversation,
  userId,
  onUpdated,
  onReviewSubmitted,
}: ChatDealActionsProps) {
  const t = useTranslations("chat");
  const dealStatusLabel = useDealStatusLabel();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBuyer = userId === conversation.buyerId;
  const isSeller = userId === conversation.sellerId;
  const closed =
    conversation.dealStatus === "purchased" ||
    conversation.dealStatus === "rejected";
  const statusLabel = dealStatusLabel(conversation.dealStatus ?? null);

  async function apply(status: "purchased" | "rejected") {
    setBusy(true);
    setError(null);
    const result = await setConversationDealAction(conversation.id, status);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onUpdated(result.conversation, result.messages);
  }

  if (closed) {
    return (
      <div className="border-t border-kumbu-border bg-kumbu-surface/95 px-4 py-3">
        <p
          className={cn(
            "text-center text-sm font-bold",
            conversation.dealStatus === "purchased"
              ? "text-emerald-600"
              : "text-red-500",
          )}
        >
          {t("dealStatus")}: {statusLabel}
        </p>
        {conversation.dealStatus === "purchased" && isBuyer && conversation.productId && (
          <div className="mx-auto mt-3 max-w-2xl">
            <ProductReviewForm
              productId={conversation.productId}
              onSubmitted={onReviewSubmitted}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-t border-kumbu-border bg-kumbu-secondary/40 px-4 py-3">
      <p className="mb-2 text-center text-xs font-semibold text-kumbu-muted">
        {t("dealState")}
      </p>
      <div className="mx-auto flex max-w-2xl flex-wrap justify-center gap-2">
        {isBuyer && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void apply("purchased")}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <CheckCircle2 className="size-4" />
              {t("iBought")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void apply("rejected")}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-red-300 bg-kumbu-surface px-4 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              <XCircle className="size-4" />
              {t("rejected")}
            </button>
          </>
        )}
        {isSeller && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void apply("rejected")}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-red-300 bg-kumbu-surface px-4 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <XCircle className="size-4" />
            {t("rejected")}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-center text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
