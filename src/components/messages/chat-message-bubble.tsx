"use client";

import { useTranslations } from "next-intl";
import { sanitizeAppLink } from "@/lib/urls/safe-link";
import { cn } from "@/lib/utils";

interface ChatMessageBubbleProps {
  body: string;
  time: string;
  mine: boolean;
  pending?: boolean;
  system?: boolean;
  attachmentUrl?: string | null;
}

export function ChatMessageBubble({
  body,
  time,
  mine,
  pending,
  system,
  attachmentUrl,
}: ChatMessageBubbleProps) {
  const tCommon = useTranslations("common");
  const tChat = useTranslations("chat");

  if (system) {
    return (
      <div className="flex w-full justify-center py-2">
        <div className="max-w-[min(92%,24rem)] rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-center text-xs leading-relaxed text-amber-950">
          {body.split("\n").map((line, i) => (
            <p key={i} className={i > 0 ? "mt-1.5" : undefined}>
              {line}
            </p>
          ))}
        </div>
      </div>
    );
  }

  const isPdf = attachmentUrl?.toLowerCase().includes(".pdf");
  const safeAttachmentUrl = sanitizeAppLink(attachmentUrl);

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
        {safeAttachmentUrl ? (
          <a
            href={safeAttachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mb-2 block rounded-lg px-2 py-1.5 text-xs font-semibold underline",
              mine ? "bg-white/15 text-white" : "bg-kumbu-secondary text-kumbu-primary",
            )}
          >
            {isPdf ? tChat("attachmentPdf") : tChat("attachmentImage")} — {tChat("openAttachment")}
          </a>
        ) : null}
        {body && body !== "📎 Ficheiro partilhado" ? (
          <p className="whitespace-pre-wrap break-words">{body}</p>
        ) : null}
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
