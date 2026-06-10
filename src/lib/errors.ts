import { parseApiValidationError } from "@/lib/api-validation";
import { ApiError } from "@/lib/kumbu-api/client";

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
  return extractAuthErrorMessage(err);
}

export { parseApiValidationError, mapBackendFieldsToForm, toActionResult } from "@/lib/api-validation";
export type { ActionResult, ApiValidationError } from "@/lib/api-validation";

/** Extrai mensagem legível de erros Supabase Auth / hooks. */
export function extractAuthErrorMessage(err: unknown): string {
    if (err instanceof ApiError) {
    if (err.status === 0) {
      return "Backend indisponível. Inicie o servidor Spring na porta 8080 e tente novamente.";
    }
    if (err.status === 401) return "Email ou palavra-passe incorrectos.";
    if (err.status === 500 && /internal/i.test(err.message)) {
      return "Erro no servidor. Verifique email e palavra-passe (mín. 8 caracteres).";
    }
    if (err.message.trim()) return err.message.trim();
  }
  if (err == null) return "Erro desconhecido.";
  if (typeof err === "string") {
    const s = err.trim();
    if (s === "{}") return "Falha ao enviar SMS. Tente novamente.";
    return s || "Erro desconhecido.";
  }
  if (err instanceof Error) {
    const msg = err.message.trim();
    if (msg === "{}") return "Falha ao enviar SMS. Tente novamente.";
    if (
      /^fetch failed$/i.test(msg) ||
      /failed to fetch|networkerror|load failed|econnreset|etimedout|aborted|socket hang up/i.test(
        msg,
      )
    ) {
      return "Ligação falhou com o servidor. Confirme que o backend está a correr (porta 8080) e reinicie o site com npm run dev:lan se estiver no telemóvel.";
    }
    if (msg) return msg;
  }
  if (typeof err === "object") {
    const o = err as Record<string, unknown>;
    if (typeof o.message === "string" && o.message.trim()) {
      const parsed = parseNestedHookMessage(o.message);
      if (parsed) return parsed;
      if (o.message.trim() !== "{}") return o.message.trim();
    }
    if (typeof o.msg === "string" && o.msg.trim()) return o.msg.trim();
    if (typeof o.error_description === "string" && o.error_description.trim()) {
      return o.error_description.replace(/\+/g, " ");
    }
    if (typeof o.error === "string" && o.error.trim()) return o.error.trim();
    if (typeof o.error === "object" && o.error !== null) {
      const nested = o.error as Record<string, unknown>;
      if (typeof nested.message === "string" && nested.message.trim()) {
        return nested.message.trim();
      }
    }
    if (typeof o.details === "string" && o.details.trim()) return o.details.trim();
    if (typeof o.code === "string" && o.code.trim()) {
      return `Erro de autenticação (${o.code}).`;
    }
    try {
      const json = JSON.stringify(err);
      if (json && json !== "{}") return json;
    } catch {
      /* ignore */
    }
  }
  return "Ocorreu um erro. Tente novamente.";
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
