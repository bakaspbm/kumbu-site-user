import { getTranslations } from "next-intl/server";
import { parseApiValidationError } from "@/lib/api-validation";
import { ApiError } from "@/lib/kumbu-api/client";

export async function formatErrorMessageServer(err: unknown): Promise<string> {
  const t = await getTranslations("errors");

  const validation = parseApiValidationError(err);
  if (validation) {
    const fieldMessages = Object.values(validation.fields);
    if (fieldMessages.length === 1) return fieldMessages[0];
    if (fieldMessages.length > 1) {
      return `${validation.message}: ${fieldMessages.join(" ")}`;
    }
    return validation.message;
  }

  if (err instanceof ApiError) {
    if (err.status === 0) return t("backendDown");
    if (err.status === 401) return t("wrongCredentials");
    if (err.status === 500 && /internal/i.test(err.message)) return t("serverError");
    if (err.message.trim()) return err.message.trim();
  }

  if (err == null) return t("unknown");
  if (typeof err === "string") {
    const s = err.trim();
    if (s === "{}") return t("smsFailed");
    return s || t("unknown");
  }

  if (err instanceof Error) {
    const msg = err.message.trim();
    if (msg === "{}") return t("smsFailed");
    if (
      /^fetch failed$/i.test(msg) ||
      /failed to fetch|networkerror|load failed|econnreset|etimedout|aborted|socket hang up/i.test(
        msg,
      )
    ) {
      return t("fetchFailed");
    }
    if (msg) return msg;
  }

  if (typeof err === "object") {
    const o = err as Record<string, unknown>;
    if (typeof o.message === "string" && o.message.trim() && o.message.trim() !== "{}") {
      return o.message.trim();
    }
  }

  return t("tryAgain");
}

export async function formatAuthUrlErrorServer(
  error?: string | null,
  code?: string | null,
  description?: string | null,
): Promise<string | null> {
  if (!error && !code && !description) return null;
  const t = await getTranslations("errors");

  if (description) {
    try {
      return decodeURIComponent(description.replace(/\+/g, " "));
    } catch {
      return description.replace(/\+/g, " ");
    }
  }

  const map: Record<string, string> = {
    otp_expired: t("otpExpired"),
    access_denied: t("accessDenied"),
    invalid_request: t("invalidRequest"),
    server_error: t("oauthServerError"),
    unauthorized_client: t("oauthClient"),
    redirect_uri_mismatch: t("redirectMismatch"),
  };
  if (code && map[code]) return map[code];
  if (error && map[error]) return map[error];
  return error ?? code ?? t("authError");
}
