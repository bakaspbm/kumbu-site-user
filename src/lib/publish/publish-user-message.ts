/** Remove prefixos técnicos de debug antes de mostrar ao utilizador. */
export function sanitizePublishError(raw: string): string {
  return raw
    .replace(/^\[Passo \d+\]\s*/i, "")
    .replace(/^\[Step \d+\]\s*/i, "")
    .replace(/^\[Étape \d+\]\s*/i, "")
    .trim();
}

const RESTRICTION_PATTERN =
  /indisponível|restrição|restricao|restrição activa|baniment|banido|desactivad|desativad|suspend|não pode publicar|nao pode publicar|cannot publish|restricted|conta activa|account active|perfil incompleto|contacte o suporte|contact support/i;

export function isAccountRestrictionMessage(message: string): boolean {
  return RESTRICTION_PATTERN.test(sanitizePublishError(message));
}

export type PublishUserMessage =
  | { kind: "restriction"; title: string; body: string; supportHref: string; supportLabel: string }
  | { kind: "error"; message: string };

export function classifyPublishError(
  raw: string,
  copy: {
    restrictedTitle: string;
    restrictedBody: string;
    contactSupport: string;
  },
): PublishUserMessage {
  const message = sanitizePublishError(raw);
  if (isAccountRestrictionMessage(message)) {
    return {
      kind: "restriction",
      title: copy.restrictedTitle,
      body: copy.restrictedBody,
      supportHref: "/support/chat",
      supportLabel: copy.contactSupport,
    };
  }
  return { kind: "error", message: message || raw };
}
