import { parseApiValidationError } from "@/lib/api-validation";
import { ApiError } from "@/lib/kumbu-api/client";

export type UserFacingError = {
  /** O que aconteceu */
  title: string;
  /** Porquê / detalhe (sem jargão técnico) */
  message: string;
  /** Próximo passo sugerido */
  action?: string;
  fields?: Record<string, string>;
};

export type ErrorMessages = {
  backendDown: string;
  wrongCredentials: string;
  serverError: string;
  unknown: string;
  tryAgain: string;
  fetchFailed: string;
  rateLimit: string;
  forbidden: string;
  notFound: string;
  validationFailed: string;
  orderNotCreated: string;
  orderNotCreatedAction: string;
  paymentMethodsFailed: string;
  paymentMethodsFailedAction: string;
  loadListFailed: string;
  loadListFailedAction: string;
  loadDetailFailed: string;
  loadDetailFailedAction: string;
  cartSyncFailed: string;
  cartSyncFailedAction: string;
  actionTryAgain: string;
  actionCheckConnection: string;
  actionLogin: string;
  actionContactSupport: string;
};

const TECHNICAL_PATTERN =
  /sql|hibernate|jdbc|flyway|stacktrace|stack trace|nullpointer|null pointer|org\.spring|org\.hibernate|com\.kumbu|java\.|jackson|parseexception|constraintviolation|internal server error|NEXT_PUBLIC|\.env|KUMBU_|facebook-trust|backend não configurad|api backend/i;

export function isTechnicalErrorMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return true;
  if (/^erro http \d{3}$/i.test(trimmed)) return true;
  return TECHNICAL_PATTERN.test(trimmed);
}

export function extractApiErrorCode(err: unknown): string | undefined {
  if (!(err instanceof ApiError) || !err.payload || typeof err.payload !== "object") {
    return undefined;
  }
  const code = (err.payload as Record<string, unknown>).code;
  return typeof code === "string" ? code : undefined;
}

export function resolveUserFacingError(err: unknown, m: ErrorMessages): UserFacingError {
  const validation = parseApiValidationError(err);
  if (validation) {
    const fieldMessages = Object.values(validation.fields);
    return {
      title: m.validationFailed,
      message:
        fieldMessages.length === 1
          ? fieldMessages[0]
          : fieldMessages.length > 1
            ? fieldMessages.join(" ")
            : validation.message,
      action: m.actionTryAgain,
      fields: validation.fields,
    };
  }

  if (err instanceof ApiError) {
    const code = extractApiErrorCode(err);
    if (err.status === 0) {
      return {
        title: m.fetchFailed,
        message: m.backendDown,
        action: m.actionCheckConnection,
      };
    }
    if (err.status === 429 || code === "RATE_LIMIT") {
      return {
        title: m.rateLimit,
        message: err.message.trim() || m.rateLimit,
        action: m.actionTryAgain,
      };
    }
    if (err.status === 401 || code === "UNAUTHORIZED") {
      return {
        title: m.wrongCredentials,
        message: isTechnicalErrorMessage(err.message) ? m.wrongCredentials : err.message.trim(),
        action: m.actionLogin,
      };
    }
    if (err.status === 403 || code === "FORBIDDEN") {
      return {
        title: m.forbidden,
        message: isTechnicalErrorMessage(err.message) ? m.forbidden : err.message.trim(),
        action: m.actionContactSupport,
      };
    }
    if (err.status === 404 || code === "NOT_FOUND") {
      return {
        title: m.notFound,
        message: isTechnicalErrorMessage(err.message) ? m.notFound : err.message.trim(),
        action: m.actionTryAgain,
      };
    }
    if (err.status >= 500 || code === "INTERNAL_ERROR") {
      return {
        title: m.serverError,
        message: isTechnicalErrorMessage(err.message) ? m.serverError : err.message.trim(),
        action: m.actionTryAgain,
      };
    }
    if (err.message.trim() && !isTechnicalErrorMessage(err.message)) {
      return {
        title: m.tryAgain,
        message: err.message.trim(),
        action: m.actionTryAgain,
      };
    }
    return {
      title: m.tryAgain,
      message: m.unknown,
      action: m.actionTryAgain,
    };
  }

  if (typeof err === "string") {
    const s = err.trim();
    if (s && !isTechnicalErrorMessage(s)) {
      return { title: m.tryAgain, message: s, action: m.actionTryAgain };
    }
  }

  if (err instanceof Error) {
    const msg = err.message.trim();
    if (
      /^fetch failed$/i.test(msg) ||
      /failed to fetch|networkerror|load failed|econnreset|etimedout|aborted|socket hang up/i.test(
        msg,
      )
    ) {
      return {
        title: m.fetchFailed,
        message: m.backendDown,
        action: m.actionCheckConnection,
      };
    }
    if (msg && !isTechnicalErrorMessage(msg)) {
      return { title: m.tryAgain, message: msg, action: m.actionTryAgain };
    }
  }

  return {
    title: m.tryAgain,
    message: m.unknown,
    action: m.actionTryAgain,
  };
}

export function resolveUserFacingErrorMessage(err: unknown, m: ErrorMessages): string {
  const u = resolveUserFacingError(err, m);
  if (u.action) return `${u.message} ${u.action}`;
  return u.message;
}
