"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ChatMessageBubbleProps {
  body: string;
  time: string;
  mine: boolean;
  pending?: boolean;
  system?: boolean;
}

export function ChatMessageBubble({
  body,
  time,
  mine,
  pending,
  system,
}: ChatMessageBubbleProps) {
  const tCommon = useTranslations("common");

  if (system) {
    return (
      <div className="flex w-full justify-center py-1">
        <p className="rounded-full bg-kumbu-secondary px-3 py-1 text-center text-xs font-semibold text-kumbu-muted">
          {body}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "relative max-w-[min(85%,20rem)] px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-opacity",
          mine
            ? "rounded-2xl rounded-br-md bg-kumbu-primary text-white"
            : "rounded-2xl rounded-bl-md border border-kumbu-border/80 bg-kumbu-surface text-kumbu-foreground",
          pending && "opacity-70",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{body}</p>
        <p
          className={cn(
            "mt-1.5 text-right text-[10px] font-medium tabular-nums",
            mine ? "text-white/75" : "text-kumbu-muted",
          )}
        >
          {pending ? tCommon("sending") : time}
        </p>
      </div>
    </div>
  );
}
