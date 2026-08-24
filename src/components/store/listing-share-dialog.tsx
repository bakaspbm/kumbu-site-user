"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Share2, X } from "lucide-react";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import {
  buildListingShareText,
  listingShareTargets,
  resolveListingShareUrl,
  type ListingSharePayload,
} from "@/lib/share/listing-share";
import { cn } from "@/lib/utils";

type ListingShareDialogProps = {
  open: boolean;
  onClose: () => void;
  listing: ListingSharePayload;
};

const CHANNELS = [
  {
    id: "whatsapp" as const,
    labelKey: "shareWhatsApp" as const,
    bg: "bg-[#25D366]",
    letter: "W",
  },
  {
    id: "facebook" as const,
    labelKey: "shareFacebook" as const,
    bg: "bg-[#1877F2]",
    letter: "f",
  },
  {
    id: "telegram" as const,
    labelKey: "shareTelegram" as const,
    bg: "bg-[#229ED9]",
    letter: "T",
  },
  {
    id: "x" as const,
    labelKey: "shareX" as const,
    bg: "bg-kumbu-foreground",
    letter: "X",
  },
];

export function ListingShareDialog({ open, onClose, listing }: ListingShareDialogProps) {
  const t = useTranslations("store");
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      return;
    }
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, [open]);

  const url = resolveListingShareUrl(listing.path);
  const text = buildListingShareText(listing);
  const targets = listingShareTargets(url, text);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: listing.title, text, url });
      onClose();
    } catch {
      /* cancelado */
    }
  }

  return (
    <ModalOverlay
      open={open}
      onClose={onClose}
      ariaLabelledBy="listing-share-title"
      panelClassName="kumbu-card-elevated w-full max-w-md overflow-hidden p-0"
    >
      <div className="flex items-start justify-between gap-3 border-b border-kumbu-border px-5 py-4">
        <div>
          <h2 id="listing-share-title" className="text-base font-semibold text-kumbu-foreground">
            {t("shareTitle")}
          </h2>
          <p className="mt-0.5 line-clamp-2 text-sm text-kumbu-muted">{listing.title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-kumbu-muted hover:bg-kumbu-surface-muted hover:text-kumbu-foreground"
          aria-label={t("shareClose")}
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 px-5 py-5">
        {CHANNELS.map((channel) => (
          <a
            key={channel.id}
            href={targets[channel.id]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 text-center"
            onClick={onClose}
          >
            <span
              className={cn(
                "inline-flex size-12 items-center justify-center rounded-full text-lg font-bold text-white shadow-sm",
                channel.bg,
              )}
              aria-hidden
            >
              {channel.letter}
            </span>
            <span className="text-[11px] font-medium text-kumbu-muted">{t(channel.labelKey)}</span>
          </a>
        ))}
      </div>

      <div className="space-y-2 border-t border-kumbu-border px-5 py-4">
        <button
          type="button"
          onClick={() => void copyLink()}
          className="flex w-full items-center gap-3 rounded-xl border border-kumbu-border bg-kumbu-surface px-4 py-3 text-left text-sm font-medium text-kumbu-foreground hover:border-kumbu-primary/40"
        >
          {copied ? (
            <Check className="size-5 text-emerald-600" aria-hidden />
          ) : (
            <Copy className="size-5 text-kumbu-primary" aria-hidden />
          )}
          <span className="min-w-0 flex-1 truncate">
            {copied ? t("linkCopiedShort") : t("shareCopyLink")}
          </span>
        </button>

        {canNativeShare ? (
          <button
            type="button"
            onClick={() => void nativeShare()}
            className="flex w-full items-center gap-3 rounded-xl border border-kumbu-border bg-kumbu-surface px-4 py-3 text-left text-sm font-medium text-kumbu-foreground hover:border-kumbu-primary/40"
          >
            <Share2 className="size-5 text-kumbu-primary" aria-hidden />
            {t("shareMore")}
          </button>
        ) : null}

        <p className="break-all px-1 pt-1 text-[11px] text-kumbu-muted">{url}</p>
      </div>
    </ModalOverlay>
  );
}
