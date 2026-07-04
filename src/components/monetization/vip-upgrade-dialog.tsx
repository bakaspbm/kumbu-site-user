"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { VipUpgradePanel } from "@/components/monetization/vip-upgrade-panel";

type Props = {
  open: boolean;
  onClose: () => void;
  categoryId?: string | null;
  limitReached?: boolean;
};

export function VipUpgradeDialog({ open, onClose, categoryId, limitReached }: Props) {
  const t = useTranslations("monetization");
  const tCommon = useTranslations("common");

  return (
    <ModalOverlay
      open={open}
      onClose={onClose}
      overlayClassName="bg-black/40"
      panelClassName="kumbu-card-elevated max-h-[90vh] w-full max-w-lg overflow-y-auto p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-kumbu-ink">{t("vipTitle")}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-kumbu-muted hover:bg-kumbu-surface"
          aria-label={tCommon("close")}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <VipUpgradePanel categoryId={categoryId} limitReached={limitReached} />
    </ModalOverlay>
  );
}
