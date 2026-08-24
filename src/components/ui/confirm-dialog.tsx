"use client";

import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  variant?: "default" | "destructive";
  busy?: boolean;
  icon?: ReactNode;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "default",
  busy = false,
  icon,
}: ConfirmDialogProps) {
  if (!open) return null;

  const isDestructive = variant === "destructive";

  return (
    <ModalOverlay
      open={open}
      onClose={busy ? () => {} : onClose}
      closeOnBackdrop={!busy}
      closeOnEscape={!busy}
      overlayClassName="bg-black/40"
      panelClassName="kumbu-card-elevated w-full max-w-md overflow-hidden p-0"
      ariaLabelledBy="confirm-dialog-title"
    >
      <div className="p-5">
        <div className="flex gap-4">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              isDestructive ? "bg-red-500/10 text-red-600" : "bg-kumbu-primary-soft text-kumbu-primary",
            )}
          >
            {icon ?? <AlertTriangle className="size-5" aria-hidden />}
          </div>
          <div className="min-w-0 pt-0.5">
            <h2 id="confirm-dialog-title" className="text-base font-bold text-kumbu-foreground">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm leading-relaxed text-kumbu-muted">{description}</p>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-kumbu-border bg-kumbu-surface-muted/40 p-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" disabled={busy} onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={isDestructive ? "primary" : "primary"}
          className={cn(isDestructive && "bg-red-600 hover:brightness-110")}
          disabled={busy}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </ModalOverlay>
  );
}
