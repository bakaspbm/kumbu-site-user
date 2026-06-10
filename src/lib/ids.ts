export function newProductId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `prd_${crypto.randomUUID()}`;
  }
  return `prd_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function newOrderId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `ord_${crypto.randomUUID()}`;
  }
  return `ord_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
