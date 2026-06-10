
import type { UserGender } from "@/lib/user-profile";
import type { JobMeta, JobListingStatus } from "@/types/job";
import type { ProductMeta } from "@/types/product";
import type { PropertyMeta } from "@/types/property";

export interface SellerSummary {
  id: string;
  displayName: string;
  photoUrl?: string | null;
  phone?: string | null;
  city?: string | null;
  sellerRating?: number | null;
  sellerReviewCount?: number;
  online?: boolean;
  lastSeenAt?: string | null;
}

export interface CatalogCategory {
  id: string;
  name: string;
  kind: string;
  sortOrder: number;
}

export interface CatalogSubcategory {
  id: string;
  categoryId: string;
  name: string;
  sortOrder: number;
}

export interface CatalogProduct {
  id: string;
  sellerId: string;
  seller?: SellerSummary | null;
  categoryId: string;
  subcategoryId?: string | null;
  title: string;
  priceLabel: string;
  rating?: number | null;
  reviewCount?: number;
  viewCount?: number;
  imageColor?: number | null;
  isOutOfStock: boolean;
  isFeatured: boolean;
  sortOrder: number;
  imageUrl?: string | null;
  imageUrls?: string[];
  description?: string | null;
  deliveryText?: string | null;
  listingKind?: "general" | "property" | "job";
  propertyMeta?: PropertyMeta | null;
  jobMeta?: JobMeta | null;
  jobListingStatus?: JobListingStatus;
  productMeta?: ProductMeta | null;
}

export interface CatalogProductInsert {
  id: string;
  categoryId: string;
  subcategoryId?: string | null;
  title: string;
  priceLabel: string;
  description?: string | null;
  deliveryText?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[];
  isFeatured?: boolean;
  listingKind?: "general" | "property" | "job";
  propertyMeta?: PropertyMeta | null;
  jobMeta?: JobMeta | null;
  jobListingStatus?: JobListingStatus;
  productMeta?: ProductMeta | null;
}

export interface CatalogProductUpdate {
  title?: string;
  priceLabel?: string;
  description?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[];
  isOutOfStock?: boolean;
  isFeatured?: boolean;
}

export interface AppMarketingBlock {
  id: string;
  kind: string;
  title?: string | null;
  subtitle?: string | null;
  gradientFrom?: string | null;
  gradientTo?: string | null;
  sortOrder: number;
}

export interface CartItem {
  productId: string;
  sellerId: string;
  quantity: number;
  title: string;
  priceLabel: string;
  imageUrl?: string | null;
}

export interface DeliveryAddress {
  line1: string;
  line2?: string | null;
  city: string;
  zip?: string | null;
  country: string;
}

export interface StoreUser {
  id: string;
  email: string;
  displayName: string;
  phone?: string | null;
  photoUrl?: string | null;
  cart: CartItem[];
  favorites: string[];
  deliveryAddress?: DeliveryAddress | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  gender?: UserGender | null;
  birthDate?: string | null;
  profileComplete?: boolean;
  canPublish?: boolean;
  missingProfileFields?: string[];
  emailVerified?: boolean;
  bannedAt?: string | null;
  bannedUntil?: string | null;
  banReason?: string | null;
}

export interface StoreUserUpdate {
  displayName?: string;
  phone?: string;
  photoUrl?: string | null;
  deliveryAddress?: DeliveryAddress;
  city?: string;
  region?: string;
  country?: string;
  gender?: UserGender | null;
  birthDate?: string | null;
}

export type ConversationDealStatus = "open" | "purchased" | "rejected" | null;

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  messageKind?: "text" | "system";
}

export interface ConversationSummary {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  updatedAt: string;
  productTitle?: string | null;
  productPriceLabel?: string | null;
  productImageUrl?: string | null;
  otherParty?: SellerSummary | null;
  lastMessage?: ConversationMessage | null;
  unreadCount?: number;
  dealStatus?: ConversationDealStatus;
  dealStatusAt?: string | null;
}

export type OrderStatus = "processing" | "shipping" | "delivered" | "cancelled";

export interface Order {
  id: string;
  userId: string;
  sellerId: string;
  status: string;
  totalLabel: string;
  createdAt: string;
  itemsCount: number;
  showTrack: boolean;
  seller?: SellerSummary | null;
  buyer?: SellerSummary | null;
}

export interface AppPaymentMethod {
  id: string;
  label: string;
  iconKey?: string | null;
  isDefault: boolean;
  sortOrder: number;
}

export interface UserNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  iconKey?: string | null;
  readAt?: string | null;
  actionUrl?: string | null;
}

export type SortMode = "default" | "rating_desc" | "price_asc";
