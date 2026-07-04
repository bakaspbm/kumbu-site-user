const closeHandlers = new Set<() => void>();

export function registerModalClose(onClose: () => void): () => void {
  closeHandlers.add(onClose);
  return () => {
    closeHandlers.delete(onClose);
  };
}

export function closeAllModals() {
  for (const onClose of closeHandlers) {
    try {
      onClose();
    } catch {
      /* ignore */
    }
  }
}
