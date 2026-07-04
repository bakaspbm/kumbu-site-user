"use client";

import {
  useCallback,
  useEffect,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { lockBodyScroll } from "@/lib/modal/body-scroll-lock";
import { useModalRouteClose } from "@/hooks/use-modal-route-close";
import { cn } from "@/lib/utils";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type ModalOverlayProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Classes do contentor exterior (backdrop + layout). */
  overlayClassName?: string;
  /** Envolve children num painel com stopPropagation; null = sem painel. */
  panelClassName?: string | null;
  zIndexClass?: string;
  ariaLabelledBy?: string;
  ariaLabel?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
};

export function ModalOverlay({
  open,
  onClose,
  children,
  overlayClassName,
  panelClassName = "max-h-[90vh] w-full max-w-lg overflow-y-auto",
  zIndexClass = "z-50",
  ariaLabelledBy,
  ariaLabel,
  closeOnBackdrop = true,
  closeOnEscape = true,
  lockScroll = true,
}: ModalOverlayProps) {
  const isClient = useIsClient();

  useModalRouteClose(open, onClose);

  useEffect(() => {
    if (!open || !lockScroll) return;
    return lockBodyScroll();
  }, [open, lockScroll]);

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeOnEscape, onClose]);

  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!closeOnBackdrop) return;
      if (e.target === e.currentTarget) onClose();
    },
    [closeOnBackdrop, onClose],
  );

  if (!open || !isClient) return null;

  const content =
    panelClassName === null ? (
      children
    ) : (
      <div className={panelClassName} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    );

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 flex items-end justify-center bg-black/50 p-4 sm:items-center sm:p-4",
        zIndexClass,
        overlayClassName,
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      onClick={handleBackdropClick}
    >
      {content}
    </div>,
    document.body,
  );
}
