import { getTranslations } from "next-intl/server";
import { formatErrorMessageServer } from "@/lib/i18n/format-error-server";

type ErrorKey =
  | "loginRequired"
  | "uploadPhotosLogin"
  | "viewConversationLogin"
  | "invalidProduct"
  | "registerViewError"
  | "loadConversationsError"
  | "conversationNotFound"
  | "markReadError"
  | "sendMessageError"
  | "startConversationError"
  | "selectImage"
  | "imageTooLarge"
  | "invalidPhotoUrl"
  | "invalidPhotoCount"
  | "maxPhotosPerListing"
  | "listingNotFoundPermission"
  | "exportError"
  | "favoritesLoginRequired"
  | "tryAgain";

async function tError(key: ErrorKey): Promise<string> {
  const t = await getTranslations("errors");
  return t(key);
}

export async function serverLoginRequiredError(): Promise<string> {
  return tError("loginRequired");
}

export async function serverViewConversationLoginError(): Promise<string> {
  return tError("viewConversationLogin");
}

export async function serverUploadPhotosLoginError(): Promise<string> {
  return tError("uploadPhotosLogin");
}

export async function serverInvalidProductError(): Promise<string> {
  return tError("invalidProduct");
}

export async function serverRegisterViewError(): Promise<string> {
  return tError("registerViewError");
}

export async function serverLoadConversationsError(): Promise<string> {
  return tError("loadConversationsError");
}

export async function serverConversationNotFoundError(): Promise<string> {
  return tError("conversationNotFound");
}

export async function serverMarkReadError(): Promise<string> {
  return tError("markReadError");
}

export async function serverSendMessageError(): Promise<string> {
  return tError("sendMessageError");
}

export async function serverStartConversationError(): Promise<string> {
  return tError("startConversationError");
}

export async function serverSelectImageError(): Promise<string> {
  return tError("selectImage");
}

export async function serverImageTooLargeError(): Promise<string> {
  return tError("imageTooLarge");
}

export async function serverInvalidPhotoUrlError(): Promise<string> {
  return tError("invalidPhotoUrl");
}

export async function serverInvalidPhotoCountError(): Promise<string> {
  return tError("invalidPhotoCount");
}

export async function serverMaxPhotosPerListingError(): Promise<string> {
  return tError("maxPhotosPerListing");
}

export async function serverListingNotFoundPermissionError(): Promise<string> {
  return tError("listingNotFoundPermission");
}

export async function serverFormatErrorMessage(err: unknown): Promise<string> {
  const t = await getTranslations("errors");
  if (err instanceof Error && err.message.trim()) {
    return err.message.trim();
  }
  if (typeof err === "string" && err.trim()) {
    return err.trim();
  }
  return t("tryAgain");
}

export async function serverActionError(err: unknown): Promise<string> {
  return formatErrorMessageServer(err);
}
