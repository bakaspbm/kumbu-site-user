import { getTranslations } from "next-intl/server";
import { errorMessagesFromTranslations } from "@/lib/i18n/error-messages";
import {
  resolveUserFacingError,
  resolveUserFacingErrorMessage,
} from "@/lib/user-facing-error";

export async function formatErrorMessageServer(err: unknown): Promise<string> {
  const t = await getTranslations("errors");
  return resolveUserFacingErrorMessage(err, errorMessagesFromTranslations(t));
}

export async function resolveUserFacingErrorServer(err: unknown) {
  const t = await getTranslations("errors");
  return resolveUserFacingError(err, errorMessagesFromTranslations(t));
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
