import type { CartItem, Order, OrderStatus } from "@/types/store";
import { getKumbuApiClient, type KumbuApiClient } from "@/lib/kumbu-api/client";

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

type CheckoutResponseDto = {
  orders?: OrderDto[] | null;
  conversationIds?: string[] | null;
  orderIds?: string[] | null;
};

function clientOrThrow(): KumbuApiClient {
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  return client;
}

function coerceDate(value: string | null | undefined): string {
  return value ?? new Date().toISOString();
}

function toOrder(row: OrderDto): Order {
  return {
    id: String(row.id),
    userId: String(row.userId),
    sellerId: String(row.sellerId),
    status: String(row.status ?? "processing"),
    totalLabel: String(row.totalLabel ?? ""),
    createdAt: coerceDate(row.createdAt),
    itemsCount: Number(row.itemsCount) || 0,
    showTrack: Boolean(row.showTrack),
    seller: null,
    buyer: null,
  };
}

function normalizeStatus(status: string): OrderStatus {
  if (status === "shipping" || status === "delivered" || status === "cancelled") return status;
  return "processing";
}

export async function createOrderBackend(request: {
  orderId: string;
  sellerId: string;
  itemsCount: number;
  totalLabel: string;
  lines?: { productId: string; quantity: number; unitPriceLabel: string }[];
}): Promise<Order> {
  const result = await checkoutOrdersBackend(
    (request.lines ?? []).map((line) => ({
      productId: line.productId,
      sellerId: request.sellerId,
      quantity: line.quantity,
      title: "",
      priceLabel: line.unitPriceLabel,
      imageUrl: null,
    })),
  );
  const first = result.orders[0];
  if (!first) throw new Error("Não foi possível criar encomenda.");
  return first;
}

export async function checkoutOrdersBackend(items: CartItem[]): Promise<{
  orders: Order[];
  orderIds: string[];
  conversationIds: string[];
}> {
  const client = clientOrThrow();
  const payload = {
    items: items.map((item) => ({
      productId: item.productId,
      sellerId: item.sellerId,
      quantity: item.quantity,
      title: item.title,
      priceLabel: item.priceLabel,
      imageUrl: item.imageUrl ?? undefined,
    })),
  };
  const row = await client.request<CheckoutResponseDto>("/orders/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return {
    orders: (row.orders ?? []).map(toOrder),
    orderIds: (row.orderIds ?? []).map(String),
    conversationIds: (row.conversationIds ?? []).map(String),
  };
}

export async function listPurchaseOrdersBackend(): Promise<Order[]> {
  const client = clientOrThrow();
  const rows = await client.request<OrderDto[]>("/orders/purchases");
  return (rows ?? []).map(toOrder);
}

export async function listSalesOrdersBackend(): Promise<Order[]> {
  const client = clientOrThrow();
  const rows = await client.request<OrderDto[]>("/orders/sales");
  return (rows ?? []).map(toOrder);
}

export async function listOrdersBackend(): Promise<Order[]> {
  return listPurchaseOrdersBackend();
}

export async function getOrderBackend(orderId: string): Promise<Order | null> {
  const client = clientOrThrow();
  try {
    const row = await client.request<OrderDto>(`/orders/${encodeURIComponent(orderId)}`);
    return toOrder(row);
  } catch {
    return null;
  }
}

export async function updateOrderStatusBackend(
  orderId: string,
  nextStatus: "processing" | "shipping" | "delivered" | "cancelled",
): Promise<Order> {
  const client = clientOrThrow();
  const row = await client.request<OrderDto>(`/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: normalizeStatus(nextStatus) }),
  });
  return toOrder(row);
}
