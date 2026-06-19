import * as catalogApi from "@/lib/kumbu-api/catalog";
import * as ordersApi from "@/lib/kumbu-api/orders";
import * as chatApi from "@/lib/kumbu-api/chat";
import * as notificationsApi from "@/lib/kumbu-api/notifications";
import * as backendReviewsApi from "@/lib/kumbu-api/reviews";
import * as backendJobsApi from "@/lib/kumbu-api/jobs";
import * as backendRentalsApi from "@/lib/kumbu-api/rentals";
import * as filesApi from "@/lib/kumbu-api/files";
import {
  addFavoriteBackend,
  getStoreUserBackend,
  listPaymentMethodsBackend,
  removeFavoriteBackend,
  syncCartBackend,
  updateStoreUserBackend,
} from "@/lib/kumbu-api/store";
import { dealStatusLabel } from "@/lib/chat/deal-labels";
import { occupiedNightSet, propertyMetaSummary } from "@/lib/property/helpers";
import type {
  CartItem,
  CatalogCategory,
  CatalogProduct,
  CatalogProductInsert,
  CatalogProductUpdate,
  CatalogSubcategory,
  ConversationMessage,
  ConversationSummary,
  Order,
  SellerSummary,
  SortMode,
  AppPaymentMethod,
  StoreUser,
  StoreUserUpdate,
  UserNotification,
} from "@/types/store";
import type { ProductReview, ProductReviewMedia } from "@/types/review";
import type { ApplicationListFilters, JobApplication, JobListFilters, UserCv, UserCvInsert } from "@/types/job";
import type { PropertyMeta, PropertyRentalRequest } from "@/types/property";
export function isApiMode(): boolean {
  return true;
}

export async function listCatalogCategories(_clientOrKind?: unknown, _kind?: string): Promise<CatalogCategory[]> {
  return catalogApi.listCatalogCategoriesBackend();
}

export async function listCatalogSubcategories(clientOrCategoryId: unknown, maybeCategoryId?: string): Promise<CatalogSubcategory[]> {
  const categoryId = (maybeCategoryId ?? clientOrCategoryId) as string;
  return catalogApi.listCatalogSubcategoriesBackend(categoryId);
}

export async function listCatalogProducts(clientOrOpts: unknown, maybeOpts?: {
    categoryId: string;
    subcategoryId?: string;
    sortMode?: SortMode;
    featuredOnly?: boolean;
  },
): Promise<CatalogProduct[]> {
  const opts = (maybeOpts ?? clientOrOpts) as {
    categoryId: string;
    subcategoryId?: string;
    sortMode?: SortMode;
    featuredOnly?: boolean;
  };
  return catalogApi.listCatalogProductsBackend(opts);
}

export async function listFeedProducts(clientOrLimit?: unknown, maybeLimit?: number): Promise<CatalogProduct[]> {
  const limit = (typeof clientOrLimit === "number" ? clientOrLimit : maybeLimit) ?? 28;
  return catalogApi.listFeedProductsBackend(limit);
}

export async function listMarketplaceProducts(opts?: {
  featuredOnly?: boolean;
  limit?: number;
  categoryId?: string;
}): Promise<CatalogProduct[]> {
  return catalogApi.listMarketplaceProductsBackend(opts);
}

export async function getFeaturedProducts(
  _clientOrCategories?: unknown,
  categoriesOrMax?: CatalogCategory[] | number,
  maybeMax?: number,
): Promise<CatalogProduct[]> {
  const max =
    (typeof categoriesOrMax === "number" ? categoriesOrMax : maybeMax) ?? 8;
  return catalogApi.getFeaturedProductsBackend(max);
}

export async function getCatalogProduct(clientOrProductId: unknown, maybeProductId?: string): Promise<CatalogProduct | null> {
  const productId = String(maybeProductId ?? clientOrProductId);
  return catalogApi.getCatalogProductBackend(productId);
}

export async function getCatalogProductsByIds(clientOrIds: unknown, maybeIds?: string[]): Promise<CatalogProduct[]> {
  const ids = (maybeIds ?? clientOrIds) as string[];
  return catalogApi.getCatalogProductsByIdsBackend(ids);
}

export async function searchCatalogProducts(query: string, limit = 24): Promise<CatalogProduct[]> {
  return catalogApi.searchCatalogProductsBackend(query, limit);
}

export async function listSellerProducts(clientOrSellerId: unknown, sellerIdOrLimit?: string | number, maybeLimit?: number): Promise<CatalogProduct[]> {
  const sellerId = String(typeof sellerIdOrLimit === "string" ? sellerIdOrLimit : clientOrSellerId);
  const limit = (typeof sellerIdOrLimit === "number" ? sellerIdOrLimit : maybeLimit) ?? 48;
  return catalogApi.listSellerProductsBackend(sellerId, limit);
}

export async function listMyListings(_client?: unknown, _sellerId?: string): Promise<CatalogProduct[]> {
  return catalogApi.listMyListingsBackend();
}

export async function createCatalogProduct(clientOrInput: unknown, maybeInput?: CatalogProductInsert): Promise<CatalogProduct> {
  const input = (maybeInput ?? clientOrInput) as CatalogProductInsert;
  return catalogApi.createCatalogProductBackend(input);
}

export async function updateCatalogProduct(
  clientOrProductId: unknown,
  productIdOrUpdate: string | CatalogProductUpdate,
  maybeUpdate?: CatalogProductUpdate,
): Promise<CatalogProduct> {
  const productId = String(maybeUpdate != null ? productIdOrUpdate : clientOrProductId);
  const update = (maybeUpdate ?? productIdOrUpdate) as CatalogProductUpdate;
  return catalogApi.updateCatalogProductBackend(productId, update);
}

export async function softDeleteCatalogProduct(clientOrProductId: unknown, maybeProductId?: string): Promise<void> {
  const productId = String(maybeProductId ?? clientOrProductId);
  return catalogApi.softDeleteCatalogProductBackend(productId);
}

export async function getPublicSeller(clientOrUserId: unknown, maybeUserId?: string): Promise<SellerSummary | null> {
  const userId = String(maybeUserId ?? clientOrUserId);
  return catalogApi.getPublicSellerBackend(userId);
}

export async function getStoreUser(_client?: unknown, _userId?: string): Promise<StoreUser | null> {
  return getStoreUserBackend();
}

export async function updateStoreUser(
  clientOrUpdate: unknown,
  updateOrUserId?: StoreUserUpdate | string,
  _userId?: string,
  _authEmail?: string | null,
): Promise<StoreUser> {
  const update = (typeof updateOrUserId === "object" && updateOrUserId != null
    ? updateOrUserId
    : clientOrUpdate) as StoreUserUpdate;
  return updateStoreUserBackend(update);
}

export async function syncCart(clientOrItems: unknown, maybeItems?: CartItem[]): Promise<void> {
  const items = (maybeItems ?? clientOrItems) as CartItem[];
  if (!Array.isArray(items)) return;
  await syncCartBackend(items);
}

export async function syncFavorites(
  clientOrProductIds: unknown,
  maybeProductIds?: string[],
): Promise<void> {
  const ids = (maybeProductIds ?? clientOrProductIds) as string[];
  const current = await getStoreUserBackend();
  const currentSet = new Set(current?.favorites ?? []);
  const nextSet = new Set(ids);
  for (const id of nextSet) {
    if (!currentSet.has(id)) await addFavoriteBackend(id);
  }
  for (const id of currentSet) {
    if (!nextSet.has(id)) await removeFavoriteBackend(id);
  }
}

export async function toggleProductFavorite(
  productId: string,
  shouldFavorite: boolean,
): Promise<void> {
  if (shouldFavorite) await addFavoriteBackend(productId);
  else await removeFavoriteBackend(productId);
}

export async function listPaymentMethods(
  _client?: unknown,
): Promise<AppPaymentMethod[]> {
  return listPaymentMethodsBackend();
}

export async function createOrder(clientOrRequest: unknown, maybeRequest?: {
    orderId: string;
    sellerId: string;
    itemsCount: number;
    totalLabel: string;
    lines?: { productId: string; quantity: number; unitPriceLabel: string }[];
  },
): Promise<Order> {
  const request = (maybeRequest ?? clientOrRequest) as {
    orderId: string;
    sellerId: string;
    itemsCount: number;
    totalLabel: string;
    lines?: { productId: string; quantity: number; unitPriceLabel: string }[];
  };
  return ordersApi.createOrderBackend(request);
}

export async function checkoutOrders(items: CartItem[]): Promise<{
  orders: Order[];
  orderIds: string[];
  conversationIds: string[];
}> {
  return ordersApi.checkoutOrdersBackend(items);
}

export async function listPurchaseOrders(_client?: unknown): Promise<Order[]> {
  return ordersApi.listPurchaseOrdersBackend();
}

export async function listSalesOrders(_client?: unknown): Promise<Order[]> {
  return ordersApi.listSalesOrdersBackend();
}

export async function listOrders(_client?: unknown): Promise<Order[]> {
  return ordersApi.listOrdersBackend();
}

export async function getOrder(clientOrOrderId: unknown, maybeOrderId?: string): Promise<Order | null> {
  const orderId = String(maybeOrderId ?? clientOrOrderId);
  return ordersApi.getOrderBackend(orderId);
}

export async function updateOrderStatus(
  clientOrOrderId: unknown,
  orderIdOrStatus: string | "processing" | "shipping" | "delivered" | "cancelled",
  maybeStatus?: "processing" | "shipping" | "delivered" | "cancelled",
): Promise<Order> {
  const orderId = String(maybeStatus != null ? orderIdOrStatus : clientOrOrderId);
  const nextStatus = (maybeStatus ?? orderIdOrStatus) as "processing" | "shipping" | "delivered" | "cancelled";
  return ordersApi.updateOrderStatusBackend(orderId, nextStatus);
}

export async function listNotifications(_client?: unknown): Promise<UserNotification[]> {
  return notificationsApi.listNotificationsBackend();
}

export async function countUnreadNotifications(_client?: unknown, _userId?: string): Promise<number> {
  return notificationsApi.countUnreadNotificationsBackend();
}

export async function getNotification(clientOrNotificationId: unknown, maybeNotificationId?: string): Promise<UserNotification | null> {
  const notificationId = String(maybeNotificationId ?? clientOrNotificationId);
  return notificationsApi.getNotificationBackend(notificationId);
}

export async function markNotificationRead(clientOrNotificationId: unknown, maybeNotificationId?: string): Promise<void> {
  const notificationId = String(maybeNotificationId ?? clientOrNotificationId);
  return notificationsApi.markNotificationReadBackend(notificationId);
}

export async function deleteAccountWeb(): Promise<void> {
  const { deleteAccountBackend } = await import("@/lib/kumbu-api/compliance");
  await deleteAccountBackend();
}

export async function exportAccountDataPrettyJson(): Promise<string> {
  const { exportAccountDataBackend } = await import("@/lib/kumbu-api/compliance");
  const data = await exportAccountDataBackend();
  return JSON.stringify(data, null, 2);
}

export async function syncUserFromAuth(_client?: unknown, _authUser?: unknown): Promise<void> {
  return;
}

export async function listMyConversations(_client?: unknown, _userId?: string): Promise<ConversationSummary[]> {
  return chatApi.listConversationsBackend();
}

export async function countUnreadMessagesForUser(_clientOrUserId: unknown, _maybeUserId?: string): Promise<number> {
  return chatApi.countUnreadMessagesBackend();
}

export async function getConversationForUser(clientOrConversationId: unknown, maybeConversationId?: string, _userId?: string): Promise<ConversationSummary | null> {
  const conversationId = String(maybeConversationId ?? clientOrConversationId);
  return chatApi.getConversationBackend(conversationId);
}

export async function listConversationMessages(clientOrConversationId: unknown, maybeConversationId?: string): Promise<ConversationMessage[]> {
  const conversationId = String(maybeConversationId ?? clientOrConversationId);
  return chatApi.listConversationMessagesBackend(conversationId);
}

export async function sendConversationMessage(
  clientOrConversationId: unknown,
  conversationIdOrBody: string,
  maybeBody?: string,
  _userId?: string,
  _options?: { skipRecipientNotification?: boolean; attachmentUrl?: string | null },
): Promise<ConversationMessage> {
  const conversationId =
    maybeBody != null ? String(conversationIdOrBody) : String(clientOrConversationId);
  const body = maybeBody != null ? String(maybeBody) : String(conversationIdOrBody);
  return chatApi.sendConversationMessageBackend(conversationId, body, _options?.attachmentUrl);
}

export async function markConversationRead(clientOrConversationId: unknown, maybeConversationId?: string, _userId?: string): Promise<void> {
  const conversationId = String(maybeConversationId ?? clientOrConversationId);
  return chatApi.markConversationReadBackend(conversationId);
}

export async function startConversation(clientOrProductId: unknown, maybeProductId?: string, _opts?: { buyerId?: string; sellerId?: string }): Promise<string> {
  const productId = String(maybeProductId ?? clientOrProductId);
  return chatApi.startConversationBackend(productId);
}

export async function ensureProductConversation(
  clientOrProductId: unknown,
  productIdOrBuyerId?: string,
  _buyerIdOrSellerId?: string,
  _sellerId?: string,
): Promise<string> {
  const productId = String(productIdOrBuyerId ?? clientOrProductId);
  return chatApi.startConversationBackend(productId);
}

export async function setConversationDeal(
  clientOrConversationId: unknown,
  conversationIdOrStatus: string | "purchased" | "rejected",
  maybeStatus?: "purchased" | "rejected",
): Promise<string> {
  const conversationId = String(maybeStatus != null ? conversationIdOrStatus : clientOrConversationId);
  const status = (maybeStatus ?? conversationIdOrStatus) as "purchased" | "rejected";
  await chatApi.setConversationDealBackend(conversationId, status);
  return status;
}

export async function buyerCanReviewProduct(productId: string): Promise<boolean> {
  return backendReviewsApi.buyerCanReviewProductBackend(productId);
}

export async function listProductReviews(clientOrProductId: unknown, productIdOrLimit?: string | number, maybeLimit?: number): Promise<ProductReview[]> {
  const productId = String(typeof productIdOrLimit === "string" ? productIdOrLimit : clientOrProductId);
  const limit = (typeof productIdOrLimit === "number" ? productIdOrLimit : maybeLimit) ?? 40;
  return backendReviewsApi.listProductReviewsBackend(productId, limit);
}

export async function submitProductReview(
  clientOrProductId: unknown,
  productIdOrRating: string | number,
  ratingOrComment?: number | string,
  commentOrMedia?: string | ProductReviewMedia[],
  mediaOrUserId?: ProductReviewMedia[] | string,
  _userId?: string,
): Promise<void> {
  const hasLegacyClientArg = typeof ratingOrComment === "number";
  const productId = String(
    hasLegacyClientArg
      ? typeof productIdOrRating === "string"
        ? productIdOrRating
        : clientOrProductId
      : clientOrProductId,
  );
  const rating = Number(hasLegacyClientArg ? ratingOrComment : productIdOrRating);
  const comment = (hasLegacyClientArg ? commentOrMedia : ratingOrComment) as string | undefined;
  const media = (hasLegacyClientArg ? mediaOrUserId : commentOrMedia) as ProductReviewMedia[];
  return backendReviewsApi.submitProductReviewBackend(productId, rating, comment, media);
}

export async function submitSellerReviewReply(clientOrReviewId: unknown, reviewIdOrReply: string, maybeReply?: string): Promise<void> {
  const reviewId = String(maybeReply != null ? reviewIdOrReply : clientOrReviewId);
  const reply = String(maybeReply ?? reviewIdOrReply);
  return backendReviewsApi.submitSellerReviewReplyBackend(reviewId, reply);
}

export async function listActiveJobs(clientOrFilters: unknown = {}, maybeFilters?: JobListFilters): Promise<CatalogProduct[]> {
  const filters = (maybeFilters ?? clientOrFilters) as JobListFilters;
  return backendJobsApi.listActiveJobsBackend(filters);
}

export async function applyToJob(clientOrJobId: unknown, jobIdOrCvId: string, cvIdOrCover?: string, maybeCover?: string): Promise<JobApplication> {
  const jobId = String(maybeCover != null ? jobIdOrCvId : clientOrJobId);
  const cvId = String(maybeCover != null ? cvIdOrCover : jobIdOrCvId);
  const coverMessage = maybeCover ?? cvIdOrCover;
  return backendJobsApi.applyToJobBackend(jobId, cvId, coverMessage);
}

export async function listApplicationsForJob(clientOrJobId: unknown, jobIdOrFilters?: string | ApplicationListFilters, filtersOrEmployerId?: ApplicationListFilters, _employerId?: string): Promise<JobApplication[]> {
  const jobId = String(typeof jobIdOrFilters === "string" ? jobIdOrFilters : clientOrJobId);
  const filters = (typeof jobIdOrFilters === "object" ? jobIdOrFilters : filtersOrEmployerId ?? {}) as ApplicationListFilters;
  return backendJobsApi.listApplicationsForJobBackend(jobId, filters);
}

export async function listMyJobApplications(_client?: unknown): Promise<JobApplication[]> {
  return backendJobsApi.listMyJobApplicationsBackend();
}

export async function listEmployerJobApplications(clientOrFilters: unknown = {}, maybeFilters?: ApplicationListFilters, _employerId?: string): Promise<JobApplication[]> {
  const filters = (maybeFilters ?? clientOrFilters) as ApplicationListFilters;
  return backendJobsApi.listEmployerJobApplicationsBackend(filters);
}

export async function respondJobApplication(clientOrApplicationId: unknown, applicationIdOrAction: string | "accept" | "reject", maybeAction?: "accept" | "reject"): Promise<JobApplication> {
  const applicationId = String(maybeAction != null ? applicationIdOrAction : clientOrApplicationId);
  const action = (maybeAction ?? applicationIdOrAction) as "accept" | "reject";
  return backendJobsApi.respondJobApplicationBackend(applicationId, action);
}

export async function recordJobApplicationCvView(applicationId: string): Promise<{ notified: boolean; firstView: boolean }> {
  return backendJobsApi.recordCvViewBackend(applicationId);
}

export async function markJobAsFilled(clientOrJobId: unknown, maybeJobId?: string, _sellerId?: string): Promise<void> {
  const jobId = String(maybeJobId ?? clientOrJobId);
  return backendJobsApi.markJobAsFilledBackend(jobId);
}

export async function getMyApplicationForJob(clientOrJobId: unknown, maybeJobId?: string): Promise<JobApplication | null> {
  const jobId = String(maybeJobId ?? clientOrJobId);
  return backendJobsApi.getMyApplicationForJobBackend(jobId);
}

export async function listMyCvs(_client?: unknown, _userId?: string): Promise<UserCv[]> {
  return backendJobsApi.listMyCvsBackend();
}

export async function createCv(clientOrInput: unknown, maybeInput?: UserCvInsert, _userId?: string): Promise<UserCv> {
  const input = (maybeInput ?? clientOrInput) as UserCvInsert;
  return backendJobsApi.createCvBackend(input);
}

export async function updateCv(clientOrCvId: unknown, cvIdOrInput: string | Partial<UserCvInsert>, inputOrUserId?: Partial<UserCvInsert> | string, _userId?: string): Promise<UserCv> {
  const cvId = String(typeof cvIdOrInput === "string" ? cvIdOrInput : clientOrCvId);
  const input = (typeof cvIdOrInput === "object" ? cvIdOrInput : inputOrUserId) as Partial<UserCvInsert>;
  return backendJobsApi.updateCvBackend(cvId, input);
}

export async function deleteCv(clientOrCvId: unknown, maybeCvId?: string, _userId?: string): Promise<void> {
  const cvId = String(maybeCvId ?? clientOrCvId);
  return backendJobsApi.deleteCvBackend(cvId);
}

export async function listOccupiedDateRanges(clientOrProductId: unknown, maybeProductId?: string): Promise<{ checkIn: string; checkOut: string }[]> {
  const productId = String(maybeProductId ?? clientOrProductId);
  return backendRentalsApi.listOccupiedDateRangesBackend(productId);
}

export async function isDailyRangeAvailable(clientOrProductId: unknown, productIdOrCheckIn: string, checkInOrCheckOut: string, maybeCheckOut?: string): Promise<boolean> {
  const productId = String(maybeCheckOut != null ? productIdOrCheckIn : clientOrProductId);
  const checkIn = maybeCheckOut != null ? checkInOrCheckOut : productIdOrCheckIn;
  const checkOut = maybeCheckOut ?? checkInOrCheckOut;
  return backendRentalsApi.isDailyRangeAvailableBackend(productId, checkIn, checkOut);
}

export async function createPropertyRentalRequest(clientOrInput: unknown, maybeInput?: {
    productId: string;
    ownerId: string;
    rentalMode: "daily" | "long_term";
    checkIn?: string;
    checkOut?: string;
    guestMessage?: string;
    priceSnapshot?: string;
  },
): Promise<PropertyRentalRequest> {
  const input = (maybeInput ?? clientOrInput) as {
    productId: string;
    ownerId: string;
    rentalMode: "daily" | "long_term";
    checkIn?: string;
    checkOut?: string;
    guestMessage?: string;
    priceSnapshot?: string;
  };
  return backendRentalsApi.createPropertyRentalRequestBackend(input);
}

export async function listMyPropertyRentalRequests(clientOrRole: unknown, maybeRole?: "owner" | "renter"): Promise<PropertyRentalRequest[]> {
  const role = (maybeRole ?? clientOrRole) as "owner" | "renter";
  return backendRentalsApi.listMyPropertyRentalRequestsBackend(role);
}

export async function respondPropertyRentalRequest(clientOrRequestId: unknown, requestIdOrAction: string | "confirm" | "reject", maybeAction?: "confirm" | "reject"): Promise<PropertyRentalRequest> {
  const requestId = String(maybeAction != null ? requestIdOrAction : clientOrRequestId);
  const action = (maybeAction ?? requestIdOrAction) as "confirm" | "reject";
  return backendRentalsApi.respondPropertyRentalRequestBackend(requestId, action);
}

export async function uploadAvatarFile(file: File): Promise<string> {
  return filesApi.uploadAvatarFileBackend(file);
}

export async function uploadListingImageFile(file: File): Promise<string> {
  return filesApi.uploadListingImageBackend(file);
}

export const propertyHelpers = {
  occupiedNightSet,
  propertyMetaSummary,
  isSaleOnlyProperty: (meta: PropertyMeta | null | undefined) =>
    (meta?.propertyType === "terreno_vazio" || meta?.propertyType === "terreno_inacabado") &&
    meta?.listingIntent === "sale",
};
