
export type PropertyType =
  | "casa"
  | "apartamento"
  | "hospedaria"
  | "quarto"
  | "hotel"
  | "terreno_vazio"
  | "terreno_inacabado";

export type PropertyListingIntent = "sale" | "rent";

export type PropertyRentPeriod = "daily" | "long_term";

export type PropertyRentalStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled";

export type PropertyRentalMode = "daily" | "long_term";

export interface PropertyMeta {
  propertyType: PropertyType;
  listingIntent: PropertyListingIntent;
  rentPeriod?: PropertyRentPeriod | null;
  province?: string | null;
  municipality?: string | null;
  bairro?: string | null;
  priceAmount?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaSqm?: number | null;
  builtAreaSqm?: number | null;
  floor?: number | null;
  parking?: boolean | null;
  furnished?: boolean | null;
  hasTitleDeed?: boolean | null;
  hasUtilities?: boolean | null;
  walledCompound?: boolean | null;
  generator?: boolean | null;
  condoFeeKz?: number | null;
  roomsCount?: number | null;
  sharedBathroom?: boolean | null;
  sharedKitchen?: boolean | null;
  mealsIncluded?: boolean | null;
  hotelStars?: number | null;
  reception24h?: boolean | null;
  breakfastIncluded?: boolean | null;
  zoning?: "residencial" | "comercial" | "agricola" | "misto" | null;
  constructionStage?: "fundacoes" | "estrutura" | "acabamentos" | "parcial" | null;
  minNights?: number | null;
  depositMonths?: number | null;
}

export interface PropertyRentalRequest {
  id: string;
  productId: string;
  renterId: string;
  ownerId: string;
  rentalMode: PropertyRentalMode;
  checkIn: string | null;
  checkOut: string | null;
  nights: number | null;
  guestMessage: string | null;
  status: PropertyRentalStatus;
  conversationId: string | null;
  priceSnapshot: string | null;
  createdAt: string;
  updatedAt: string;
  productTitle?: string | null;
  productImageUrl?: string | null;
  otherPartyName?: string | null;
}
