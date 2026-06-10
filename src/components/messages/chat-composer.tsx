"use client";

import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  sending?: boolean;
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  disabled,
  sending,
}: ChatComposerProps) {
  const t = useTranslations("chat");

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !sending && value.trim()) onSubmit();
    }
  }

  return (
    <div className="border-t border-kumbu-border/80 bg-kumbu-surface/95 px-3 py-3 backdrop-blur-md md:px-4">
      <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-2xl border border-kumbu-border bg-kumbu-secondary/50 p-2 shadow-[var(--shadow-kumbu-card)]">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("typeMessage")}
          rows={1}
          maxLength={2000}
          disabled={disabled || sending}
          className={cn(
            "max-h-28 min-h-[2.75rem] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-kumbu-foreground",
            "placeholder:text-kumbu-muted focus:outline-none",
          )}
        />
        <button
          type="button"
          disabled={disabled || sending || !value.trim()}
          onClick={onSubmit}
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl transition-all",
            "bg-kumbu-primary text-white shadow-[var(--shadow-kumbu-xs)]",
            "hover:brightness-105 active:scale-[0.98] disabled:opacity-40",
          )}
          aria-label={t("sendMessageAria")}
        >
          <Send className={cn("size-5", sending && "animate-pulse")} />
        </button>
      </div>
      <p className="mx-auto mt-1.5 max-w-2xl text-center text-[10px] text-kumbu-muted">
        {t("composerHint")}
      </p>
    </div>
  );
}
