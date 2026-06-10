import type { PropertyRentalRequest } from "@/types/property";
import { getKumbuApiClient, type KumbuApiClient } from "@/lib/kumbu-api/client";

type RentalDto = {
  id: string;
  productId: string;
  renterId: string;
  ownerId: string;
  rentalMode: PropertyRentalRequest["rentalMode"];
  checkIn?: string | null;
  checkOut?: string | null;
  nights?: number | null;
  guestMessage?: string | null;
  status: PropertyRentalRequest["status"];
  conversationId?: string | null;
  priceSnapshot?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  productTitle?: string | null;
  productImageUrl?: string | null;
  otherPartyName?: string | null;
};

type DateRangeDto = {
  checkIn?: string | null;
  checkOut?: string | null;
};

type AvailableDto = {
  available?: boolean | null;
};

function clientOrThrow(): KumbuApiClient {
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  return client;
}

function toRental(row: RentalDto): PropertyRentalRequest {
  return {
    id: String(row.id),
    productId: String(row.productId),
    renterId: String(row.renterId),
    ownerId: String(row.ownerId),
    rentalMode: row.rentalMode,
    checkIn: row.checkIn ?? null,
    checkOut: row.checkOut ?? null,
    nights: row.nights ?? null,
    guestMessage: row.guestMessage ?? null,
    status: row.status,
    conversationId: row.conversationId ?? null,
    priceSnapshot: row.priceSnapshot ?? null,
    createdAt: String(row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updatedAt ?? new Date().toISOString()),
    productTitle: row.productTitle ?? null,
    productImageUrl: row.productImageUrl ?? null,
    otherPartyName: row.otherPartyName ?? null,
  };
}

export async function listMyPropertyRentalRequestsBackend(
  role: "owner" | "renter",
): Promise<PropertyRentalRequest[]> {
  const client = clientOrThrow();
  const rows = await client.request<RentalDto[]>("/rentals", { query: { role } });
  return (rows ?? []).map(toRental);
}

export async function createPropertyRentalRequestBackend(input: {
  productId: string;
  ownerId: string;
  rentalMode: "daily" | "long_term";
  checkIn?: string;
  checkOut?: string;
  guestMessage?: string;
  priceSnapshot?: string;
}): Promise<PropertyRentalRequest> {
  const client = clientOrThrow();
  const row = await client.request<RentalDto>("/rentals", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return toRental(row);
}

export async function respondPropertyRentalRequestBackend(
  requestId: string,
  action: "confirm" | "reject",
): Promise<PropertyRentalRequest> {
  const client = clientOrThrow();
  const row = await client.request<RentalDto>(`/rentals/${encodeURIComponent(requestId)}/respond`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
  return toRental(row);
}

export async function listOccupiedDateRangesBackend(
  productId: string,
): Promise<{ checkIn: string; checkOut: string }[]> {
  const client = clientOrThrow();
  const rows = await client.request<DateRangeDto[]>(
    `/rentals/products/${encodeURIComponent(productId)}/occupied`,
  );
  return (rows ?? [])
    .filter((row) => row.checkIn && row.checkOut)
    .map((row) => ({ checkIn: String(row.checkIn), checkOut: String(row.checkOut) }));
}

export async function isDailyRangeAvailableBackend(
  productId: string,
  checkIn: string,
  checkOut: string,
): Promise<boolean> {
  const client = clientOrThrow();
  const row = await client.request<AvailableDto>(
    `/rentals/products/${encodeURIComponent(productId)}/available`,
    { query: { checkIn, checkOut } },
  );
  return row.available === true;
}
