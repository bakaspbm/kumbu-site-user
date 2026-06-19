import type { ErrorMessages } from "@/lib/user-facing-error";

/** Mapeia chaves next-intl `errors.*` para resolveUserFacingError. */
export function errorMessagesFromTranslations(
  t: (key: keyof ErrorMessages | string) => string,
): ErrorMessages {
  return {
    backendDown: t("backendDown"),
    wrongCredentials: t("wrongCredentials"),
    serverError: t("serverError"),
    unknown: t("unknown"),
    tryAgain: t("tryAgain"),
    fetchFailed: t("fetchFailed"),
    rateLimit: t("rateLimit"),
    forbidden: t("forbidden"),
    notFound: t("notFoundGeneric"),
    validationFailed: t("validationFailed"),
    orderNotCreated: t("orderNotCreated"),
    orderNotCreatedAction: t("orderNotCreatedAction"),
    paymentMethodsFailed: t("paymentMethodsFailed"),
    paymentMethodsFailedAction: t("paymentMethodsFailedAction"),
    loadListFailed: t("loadListFailed"),
    loadListFailedAction: t("loadListFailedAction"),
    loadDetailFailed: t("loadDetailFailed"),
    loadDetailFailedAction: t("loadDetailFailedAction"),
    cartSyncFailed: t("cartSyncFailed"),
    cartSyncFailedAction: t("cartSyncFailedAction"),
    actionTryAgain: t("actionTryAgain"),
    actionCheckConnection: t("actionCheckConnection"),
    actionLogin: t("actionLogin"),
    actionContactSupport: t("actionContactSupport"),
  };
}
