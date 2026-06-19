/** Erro do backend quando o utilizador atingiu max_listings (ex.: 3 no plano gratuito). */
export function isListingLimitError(message: string | null | undefined): boolean {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return (
    normalized.includes("limite de anúncios") ||
    normalized.includes("limite de anuncios") ||
    normalized.includes("listing limit") ||
    normalized.includes("upgrade para vip") ||
    normalized.includes("upgrade to vip")
  );
}
