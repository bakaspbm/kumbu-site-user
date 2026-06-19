import { parseApiValidationError } from "@/lib/api-validation";
import { resolveUserFacingErrorMessage } from "@/lib/user-facing-error";

const SERVER_ERROR_MESSAGES = {
  backendDown: "Serviço temporariamente indisponível. Tente novamente dentro de momentos.",
  wrongCredentials: "Email ou palavra-passe incorrectos.",
  serverError: "Erro no servidor. Tente novamente dentro de momentos.",
  unknown: "Erro desconhecido.",
  tryAgain: "Ocorreu um erro. Tente novamente.",
  fetchFailed: "Sem ligação ao servidor. Verifique a internet e tente outra vez.",
  rateLimit: "Demasiados pedidos. Aguarde um momento e tente novamente.",
  forbidden: "Não tem permissão para esta acção.",
  notFound: "O conteúdo que procura não foi encontrado.",
  validationFailed: "Verifique os campos assinalados.",
  orderNotCreated: "O pedido não foi criado.",
  orderNotCreatedAction: "Nenhum pagamento foi processado. Revise os dados e tente novamente.",
  paymentMethodsFailed: "Não foi possível carregar os métodos de pagamento.",
  paymentMethodsFailedAction: "Pode continuar — o pagamento combina-se com o vendedor no chat.",
  loadListFailed: "Não foi possível carregar a lista.",
  loadListFailedAction: "Actualize a página ou tente novamente dentro de momentos.",
  loadDetailFailed: "Não foi possível carregar os detalhes.",
  loadDetailFailedAction: "Verifique a ligação e tente novamente.",
  cartSyncFailed: "O carrinho não foi guardado no servidor.",
  cartSyncFailedAction: "Os artigos continuam no seu dispositivo — tente sincronizar outra vez.",
  actionTryAgain: "Tente novamente.",
  actionCheckConnection: "Verifique a ligação à internet e tente outra vez.",
  actionLogin: "Inicie sessão e tente novamente.",
  actionContactSupport: "Se o problema persistir, contacte o suporte.",
};

export function formatErrorMessage(err: unknown): string {
  const validation = parseApiValidationError(err);
  if (validation) {
    const fieldMessages = Object.values(validation.fields);
    if (fieldMessages.length === 1) return fieldMessages[0];
    if (fieldMessages.length > 1) {
      return `${validation.message}: ${fieldMessages.join(" ")}`;
    }
    return validation.message;
  }
  return resolveUserFacingErrorMessage(err, SERVER_ERROR_MESSAGES);
}

export { parseApiValidationError, mapBackendFieldsToForm, toActionResult } from "@/lib/api-validation";
export type { ActionResult, ApiValidationError } from "@/lib/api-validation";

/** Extrai mensagem legível de erros OAuth / hooks. */
export function extractAuthErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const o = err as Record<string, unknown>;
    if (typeof o.message === "string" && o.message.trim()) {
      const parsed = parseNestedHookMessage(o.message);
      if (parsed) return parsed;
    }
    if (typeof o.error_description === "string" && o.error_description.trim()) {
      return o.error_description.replace(/\+/g, " ");
    }
  }
  return formatErrorMessage(err);
}

function parseNestedHookMessage(message: string): string | null {
  const trimmed = message.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(trimmed) as {
      error?: { message?: string };
      message?: string;
    };
    if (typeof parsed.error?.message === "string" && parsed.error.message.trim()) {
      return parsed.error.message.trim();
    }
    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message.trim();
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function toError(err: unknown): Error {
  if (err instanceof Error && err.message) return err;
  return new Error(formatErrorMessage(err));
}

const AUTH_CODE_MESSAGES: Record<string, string> = {
  otp_expired: "O link de email ou código expirou. Peça um novo ou use email e palavra-passe.",
  access_denied: "Entrada cancelada. Pode tentar outra vez.",
  invalid_request: "Pedido de autenticação inválido.",
  server_error: "Erro temporário do fornecedor (Google/Facebook). Tente mais tarde.",
  unauthorized_client: "App OAuth não autorizada. Verifique GOOGLE_CLIENT_ID / FACEBOOK_APP_ID.",
  redirect_uri_mismatch:
    "URL de retorno incorrecta. Adicione /auth/callback no Google/Facebook.",
};

export function formatAuthUrlError(
  error?: string | null,
  code?: string | null,
  description?: string | null,
): string | null {
  if (!error && !code && !description) return null;
  if (description) {
    try {
      return decodeURIComponent(description.replace(/\+/g, " "));
    } catch {
      return description.replace(/\+/g, " ");
    }
  }
  if (code && AUTH_CODE_MESSAGES[code]) return AUTH_CODE_MESSAGES[code];
  if (error && AUTH_CODE_MESSAGES[error]) return AUTH_CODE_MESSAGES[error];
  return error ?? code ?? "Erro de autenticação.";
}
