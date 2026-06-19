import type {
  CatalogCategory,
  CatalogProduct,
  CartItem,
  AppPaymentMethod,
  ConversationMessage,
  ConversationSummary,
  Order,
  StoreUser,
  StoreUserUpdate,
} from "@/types/store";
import {
  type KumbuApiClient,
  getKumbuApiClient,
  type ApiError,
  normalizeBackendAssetUrl,
} from "@/lib/kumbu-api/client";

type CategoryDto = {
  id: string;
  name: string;
  kind?: string | null;
};

type ListingDto = {
  id: string;
  sellerId?: string | null;
  sellerName?: string | null;
  sellerPhotoUrl?: string | null;
  categoryId?: string | null;
  title: string;
  priceLabel?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  imageUrls?: string[] | null;
  description?: string | null;
  listingKind?: string | null;
  featured?: boolean | null;
  outOfStock?: boolean | null;
};

type PageDto<T> = {
  content?: T[] | null;
};

type UserProfileDto = {
  id: string;
  email?: string | null;
  fullName?: string | null;
  phone?: string | null;
  profileImageUrl?: string | null;
  favorites?: string[] | null;
  deliveryAddress?: Record<string, unknown> | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  age?: number | null;
  profileComplete?: boolean | null;
  canPublish?: boolean | null;
  missingProfileFields?: string[] | null;
  emailVerified?: boolean | null;
  sellerVerified?: boolean | null;
  bannedAt?: string | null;
  bannedUntil?: string | null;
  banReason?: string | null;
  accountSuspended?: boolean | null;
  banned_at?: string | null;
  banned_until?: string | null;
  ban_reason?: string | null;
  cart?: unknown;
};

function genderFromApi(code: string | null | undefined): StoreUser["gender"] {
  if (!code) return null;
  const map: Record<string, NonNullable<StoreUser["gender"]>> = {
    male: "masculino",
    female: "feminino",
    other: "outro",
    masculino: "masculino",
    feminino: "feminino",
    outro: "outro",
  };
  return map[code.toLowerCase()] ?? null;
}

function genderToApi(gender: StoreUserUpdate["gender"]): string | undefined {
  if (!gender) return undefined;
  const map: Record<NonNullable<StoreUserUpdate["gender"]>, string> = {
    masculino: "masculino",
    feminino: "feminino",
    outro: "outro",
  };
  return map[gender];
}

type ConversationDto = {
  id: string;
  productId: string;
  productTitle?: string | null;
  buyerId: string;
  sellerId: string;
  otherPartyId?: string | null;
  otherPartyName?: string | null;
  lastMessageBody?: string | null;
  lastMessageSenderId?: string | null;
  lastMessageAt?: string | null;
  updatedAt?: string | null;
  dealStatus?: string | null;
  unreadCount?: number | null;
  otherPartyLastSeenAt?: string | null;
  otherPartyOnline?: boolean | null;
};

type MessageDto = {
  id: string;
  conversationId?: string;
  conversation_id?: string;
  senderId?: string;
  sender_id?: string;
  body: string;
  createdAt?: string;
  created_at?: string;
  messageKind?: string | null;
  message_kind?: string | null;
  attachmentUrl?: string | null;
  attachment_url?: string | null;
};

type OrderDto = {
  id: string;
  userId: string;
  sellerId: string;
  status: string;
  totalLabel: string;
  itemsCount: number;
  createdAt: string;
  showTrack: boolean;
};

function clientOrThrow(): KumbuApiClient {
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  return client;
}

function coerceDate(value: string | null | undefined): string {
  return value ?? new Date().toISOString();
}

function toCategory(row: CategoryDto, index: number): CatalogCategory {
  return {
    id: String(row.id),
    name: String(row.name),
    kind: row.kind ?? "product",
    sortOrder: index,
  };
}

function toProduct(row: ListingDto, index: number): CatalogProduct {
  const imageUrls = (row.imageUrls ?? []).map((u) => normalizeBackendAssetUrl(u) ?? u);
  return {
    id: String(row.id),
    sellerId: String(row.sellerId ?? ""),
    seller: row.sellerId
      ? {
          id: String(row.sellerId),
          displayName: row.sellerName ?? "Utilizador",
          photoUrl: normalizeBackendAssetUrl(row.sellerPhotoUrl),
        }
      : null,
    categoryId: String(row.categoryId ?? ""),
    subcategoryId: null,
    title: String(row.title ?? ""),
    priceLabel: row.priceLabel ?? "",
    rating: row.rating ?? null,
    reviewCount: row.reviewCount ?? 0,
    isOutOfStock: Boolean(row.outOfStock),
    isFeatured: Boolean(row.featured),
    sortOrder: index,
    imageUrls,
    imageUrl: imageUrls[0] ?? null,
    description: row.description ?? null,
    listingKind:
      row.listingKind === "property"
        ? "property"
        : row.listingKind === "job"
          ? "job"
          : "general",
  };
}

function mapBackendDeliveryAddress(
  delivery: Record<string, unknown> | null | undefined,
): StoreUser["deliveryAddress"] {
  if (!delivery) return null;
  const line1 = String(
    (delivery.street as string) ?? (delivery.line1 as string) ?? "",
  ).trim();
  if (!line1 && !delivery.city) return null;
  return {
    line1,
    line2: ((delivery.line2 as string) ?? null) || null,
    city: String((delivery.city as string) ?? ""),
    zip:
      ((delivery.postalCode as string) ?? (delivery.zip as string) ?? null) ||
      null,
    country: String((delivery.country as string) ?? ""),
  };
}

function mapCartItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        productId: String(row.productId ?? row.product_id ?? ""),
        sellerId: String(row.sellerId ?? row.seller_id ?? ""),
        quantity: Number(row.quantity ?? 1) || 1,
        title: String(row.title ?? ""),
        priceLabel: String(row.priceLabel ?? row.price_label ?? ""),
        imageUrl:
          row.imageUrl != null
            ? String(row.imageUrl)
            : row.image_url != null
              ? String(row.image_url)
              : null,
      };
    })
    .filter((item) => item.productId);
}

function toStoreUser(row: UserProfileDto): StoreUser {
  const delivery =
    row.deliveryAddress && typeof row.deliveryAddress === "object"
      ? (row.deliveryAddress as Record<string, unknown>)
      : null;
  const deliveryAddress = mapBackendDeliveryAddress(delivery);
  return {
    id: String(row.id),
    email: row.email ?? "",
    displayName: row.fullName ?? "",
    phone: row.phone ?? null,
    photoUrl: normalizeBackendAssetUrl(row.profileImageUrl),
    cart: mapCartItems(row.cart),
    favorites: row.favorites ?? [],
    deliveryAddress,
    city: row.city ?? deliveryAddress?.city ?? null,
    region: row.region ?? null,
    country: row.country ?? deliveryAddress?.country ?? null,
    gender: genderFromApi(row.gender),
    birthDate: row.birthDate ?? null,
    profileComplete: Boolean(row.profileComplete),
    canPublish: Boolean(row.canPublish),
    missingProfileFields: row.missingProfileFields ?? [],
    emailVerified: row.emailVerified === true,
    sellerVerified: row.sellerVerified === true,
    bannedAt: (row.bannedAt ?? row.banned_at ?? null) as string | null,
    bannedUntil: (row.bannedUntil ?? row.banned_until ?? null) as string | null,
    banReason: (row.banReason ?? row.ban_reason ?? null) as string | null,
  };
}

function isUnauthorized(error: unknown): boolean {
  const err = error as ApiError | undefined;
  return !!err && typeof err.status === "number" && (err.status === 401 || err.status === 403);
}

export async function listCatalogCategoriesBackend(): Promise<CatalogCategory[]> {
  const client = clientOrThrow();
  const rows = await client.request<CategoryDto[]>("/catalog/categories");
  return (rows ?? []).map(toCategory);
}

export async function listFeedProductsBackend(limit = 28): Promise<CatalogProduct[]> {
  const client = clientOrThrow();
  const page = await client.request<PageDto<ListingDto>>("/catalog/listings", {
    query: { page: 0, size: limit },
  });
  return (page.content ?? []).map(toProduct);
}

export async function getFeaturedProductsBackend(max = 8): Promise<CatalogProduct[]> {
  const client = clientOrThrow();
  const page = await client.request<PageDto<ListingDto>>("/catalog/listings/featured", {
    query: { page: 0, size: max },
  });
  return (page.content ?? []).map(toProduct);
}

export async function getCatalogProductBackend(productId: string): Promise<CatalogProduct | null> {
  const client = clientOrThrow();
  try {
    const row = await client.request<ListingDto>(`/catalog/listings/${encodeURIComponent(productId)}`);
    return toProduct(row, 0);
  } catch (error) {
    if (isUnauthorized(error)) throw error;
    return null;
  }
}

export async function getStoreUserBackend(): Promise<StoreUser | null> {
  const client = clientOrThrow();
  try {
    const row = await client.request<UserProfileDto>("/users/me");
    return toStoreUser(row);
  } catch (error) {
    if (isUnauthorized(error)) return null;
    throw error;
  }
}

export async function syncCartBackend(items: CartItem[]): Promise<void> {
  const client = clientOrThrow();
  await client.request<void>("/store/cart", {
    method: "PUT",
    body: JSON.stringify({
      items: items.map((item) => ({
        productId: item.productId,
        sellerId: item.sellerId,
        quantity: item.quantity,
        title: item.title,
        priceLabel: item.priceLabel,
        imageUrl: item.imageUrl ?? undefined,
      })),
    }),
  });
}

export async function listPaymentMethodsBackend(): Promise<AppPaymentMethod[]> {
  const client = clientOrThrow();
  const row = await client.request<{ items?: Record<string, unknown>[] }>("/store/payment-methods");
  const items = row.items ?? [];
  return items.map((method, index) => ({
    id: String(method.id),
    label: String(method.label ?? ""),
    iconKey: method.iconKey != null ? String(method.iconKey) : method.icon_key != null ? String(method.icon_key) : null,
    isDefault: Boolean(method.isDefault ?? method.is_default),
    sortOrder: Number(method.sortOrder ?? method.sort_order ?? index),
  }));
}

export async function updateStoreUserBackend(update: StoreUserUpdate): Promise<StoreUser> {
  const client = clientOrThrow();
  const body: Record<string, unknown> = {};
  if (update.displayName != null) body.fullName = update.displayName.trim();
  if (update.phone != null) body.phone = update.phone.trim();
  if (update.photoUrl != null) body.photoUrl = update.photoUrl;
  if (update.city != null) body.city = update.city.trim();
  if (update.region != null) body.region = update.region.trim();
  if (update.country != null) body.country = update.country.trim();
  const gender = genderToApi(update.gender);
  if (gender) body.gender = gender;
  if (update.birthDate != null) body.birthDate = update.birthDate;
  const base = await client.request<UserProfileDto>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (update.deliveryAddress) {
    const addr = update.deliveryAddress;
    const recipientName = (update.displayName ?? base.fullName ?? "").trim();
    const phone = (update.phone ?? base.phone ?? "").trim();
    const updated = await client.request<UserProfileDto>("/users/me/delivery-address", {
      method: "PUT",
      body: JSON.stringify({
        recipientName: recipientName || "Utilizador",
        phone,
        street: addr.line1.trim(),
        city: addr.city.trim(),
        region: (update.region ?? base.region ?? "").trim() || undefined,
        country: addr.country.trim(),
        postalCode: addr.zip?.trim() || undefined,
      }),
    });
    return toStoreUser(updated);
  }
  return toStoreUser(base);
}

export async function getPublishReadinessBackend(): Promise<{
  profileComplete: boolean;
  canPublish: boolean;
  missingFields: string[];
  missingLabels: string[];
  message: string;
}> {
  const client = clientOrThrow();
  const row = await client.request<{
    profile_complete?: boolean;
    can_publish?: boolean;
    missing_fields?: string[];
    missing_labels?: string[];
    message?: string;
  }>("/users/me/publish-readiness");
  return {
    profileComplete: Boolean(row.profile_complete),
    canPublish: Boolean(row.can_publish),
    missingFields: row.missing_fields ?? [],
    missingLabels: row.missing_labels ?? [],
    message: row.message ?? "",
  };
}

export async function listPurchaseOrdersBackend(): Promise<Order[]> {
  const client = clientOrThrow();
  const rows = await client.request<OrderDto[]>("/orders/purchases");
  return (rows ?? []).map((row) => ({
    id: row.id,
    userId: row.userId,
    sellerId: row.sellerId,
    status: row.status,
    totalLabel: row.totalLabel,
    createdAt: coerceDate(row.createdAt),
    itemsCount: Number(row.itemsCount) || 0,
    showTrack: Boolean(row.showTrack),
    seller: null,
    buyer: null,
  }));
}

export async function listConversationsBackend(): Promise<ConversationSummary[]> {
  const client = clientOrThrow();
  const rows = await client.request<ConversationDto[]>("/chat/conversations");
  return (rows ?? []).map((row) => ({
    id: String(row.id),
    productId: String(row.productId),
    buyerId: String(row.buyerId),
    sellerId: String(row.sellerId),
    updatedAt: coerceDate(row.updatedAt),
    productTitle: row.productTitle ?? null,
    productPriceLabel: null,
    productImageUrl: null,
    otherParty: row.otherPartyId
      ? {
          id: String(row.otherPartyId),
          displayName: row.otherPartyName ?? "Utilizador",
          photoUrl: null,
          online: row.otherPartyOnline === true,
          lastSeenAt: row.otherPartyLastSeenAt ?? null,
        }
      : null,
    lastMessage: row.lastMessageBody
      ? {
          id: `last:${row.id}`,
          conversationId: String(row.id),
          senderId: row.lastMessageSenderId ? String(row.lastMessageSenderId) : "",
          body: row.lastMessageBody,
          createdAt: coerceDate(row.lastMessageAt ?? row.updatedAt),
          messageKind: "text",
        }
      : null,
    unreadCount: Math.max(0, Number(row.unreadCount ?? 0)),
    dealStatus:
      row.dealStatus === "open" || row.dealStatus === "purchased" || row.dealStatus === "rejected"
        ? row.dealStatus
        : null,
    dealStatusAt: null,
  }));
}

export async function listConversationMessagesBackend(
  conversationId: string,
): Promise<ConversationMessage[]> {
  const client = clientOrThrow();
  const rows = await client.request<MessageDto[]>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
  );
  return (rows ?? []).map((row) => {
    const kind = row.messageKind ?? row.message_kind ?? "text";
    return {
      id: String(row.id),
      conversationId: String(row.conversationId ?? row.conversation_id ?? ""),
      senderId: String(row.senderId ?? row.sender_id ?? ""),
      body: String(row.body ?? ""),
      createdAt: coerceDate(row.createdAt ?? row.created_at),
      messageKind:
        kind === "system" ? "system" : kind === "attachment" ? "attachment" : "text",
      attachmentUrl: row.attachmentUrl ?? row.attachment_url ?? null,
    };
  });
}

export async function startConversationBackend(productId: string): Promise<string> {
  const client = clientOrThrow();
  const row = await client.request<ConversationDto>("/chat/conversations", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
  return String(row.id);
}

export async function sendConversationMessageBackend(
  conversationId: string,
  body: string,
): Promise<ConversationMessage> {
  const client = clientOrThrow();
  const row = await client.request<MessageDto>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ body }),
    },
  );
  const kind = row.messageKind ?? row.message_kind ?? "text";
  return {
    id: String(row.id),
    conversationId: String(row.conversationId ?? row.conversation_id ?? ""),
    senderId: String(row.senderId ?? row.sender_id ?? ""),
    body: String(row.body ?? ""),
    createdAt: coerceDate(row.createdAt ?? row.created_at),
    messageKind:
      kind === "system" ? "system" : kind === "attachment" ? "attachment" : "text",
    attachmentUrl: row.attachmentUrl ?? row.attachment_url ?? null,
  };
}

export async function addFavoriteBackend(productId: string): Promise<void> {
  const client = clientOrThrow();
  await client.request<void>(`/users/me/favorites/${encodeURIComponent(productId)}`, {
    method: "POST",
  });
}

export async function removeFavoriteBackend(productId: string): Promise<void> {
  const client = clientOrThrow();
  await client.request<void>(`/users/me/favorites/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
}
