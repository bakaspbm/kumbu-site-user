import { getKumbuApiClient, type KumbuApiClient } from "@/lib/kumbu-api/client";

export type MonetizationProduct = {
  id: string;
  name: string;
  description?: string | null;
  priceAmount?: number | null;
  priceLabel?: string | null;
  durationDays?: number | null;
  active?: boolean;
  featureType?: string | null;
};

export type PaymentProvider = {
  id: string;
  name: string;
  instructions?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  active?: boolean;
};

export type MonetizationCatalog = {
  products: MonetizationProduct[];
  chargingEnabled: boolean;
  chargingMessage?: string | null;
};

export type MonetizationPayment = {
  id: string;
  status: string;
  productId?: string | null;
  productName?: string | null;
  amount?: number | null;
  amountLabel?: string | null;
  providerId?: string | null;
  providerName?: string | null;
  instructions?: string | null;
  proofUrl?: string | null;
  proofNote?: string | null;
  targetType?: string | null;
  targetId?: string | null;
};

function clientOrThrow(): KumbuApiClient {
  const client = getKumbuApiClient();
  if (!client) throw new Error("API backend não configurada.");
  return client;
}

function mapProduct(row: Record<string, unknown>): MonetizationProduct {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    description: (row.description as string | null | undefined) ?? null,
    priceAmount: (row.price_amount ?? row.priceAmount) as number | null | undefined,
    priceLabel: (row.price_label ?? row.priceLabel) as string | null | undefined,
    durationDays: (row.duration_days ?? row.durationDays) as number | null | undefined,
    active: row.active !== false,
    featureType: (row.feature_type ?? row.featureType) as string | null | undefined,
  };
}

function mapProvider(row: Record<string, unknown>): PaymentProvider {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    instructions: (row.instructions as string | null | undefined) ?? null,
    accountNumber: (row.account_number ?? row.accountNumber) as string | null | undefined,
    accountName: (row.account_name ?? row.accountName) as string | null | undefined,
    active: row.active !== false,
  };
}

function mapPayment(row: Record<string, unknown>): MonetizationPayment {
  return {
    id: String(row.id ?? ""),
    status: String(row.status ?? ""),
    productId: (row.product_id ?? row.productId) as string | null | undefined,
    productName: (row.product_name ?? row.productName) as string | null | undefined,
    amount: row.amount as number | null | undefined,
    amountLabel: (row.amount_label ?? row.amountLabel) as string | null | undefined,
    providerId: (row.provider_id ?? row.providerId) as string | null | undefined,
    providerName: (row.provider_name ?? row.providerName) as string | null | undefined,
    instructions: (row.instructions ?? row.payment_instructions) as string | null | undefined,
    proofUrl: (row.proof_url ?? row.proofUrl) as string | null | undefined,
    proofNote: (row.proof_note ?? row.proofNote) as string | null | undefined,
    targetType: (row.target_type ?? row.targetType) as string | null | undefined,
    targetId: (row.target_id ?? row.targetId) as string | null | undefined,
  };
}

export async function getMonetizationCatalogBackend(
  categoryId?: string,
): Promise<MonetizationCatalog> {
  const client = clientOrThrow();
  const data = await client.request<Record<string, unknown>>("/monetization/catalog", {
    query: categoryId ? { categoryId } : undefined,
  });
  const charging = data.charging as Record<string, unknown> | undefined;
  const rawProducts = (data.products ?? data.items) as unknown[] | undefined;
  return {
    products: (rawProducts ?? [])
      .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
      .map(mapProduct),
    chargingEnabled: charging?.enabled === true,
    chargingMessage: (charging?.message as string | undefined) ?? null,
  };
}

export async function listPaymentProvidersBackend(): Promise<PaymentProvider[]> {
  const client = clientOrThrow();
  const data = await client.request<{ providers?: unknown[] }>("/monetization/payment-providers");
  return (data.providers ?? [])
    .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
    .map(mapProvider)
    .filter((p) => p.active !== false);
}

export async function initiateMonetizationPaymentBackend(input: {
  productId: string;
  providerId: string;
  targetType?: string;
  targetId?: string;
}): Promise<MonetizationPayment> {
  const client = clientOrThrow();
  const row = await client.request<Record<string, unknown>>("/monetization/payments", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return mapPayment(row);
}

export async function submitPaymentProofBackend(
  paymentId: string,
  proofUrl: string,
  proofNote?: string,
): Promise<MonetizationPayment> {
  const client = clientOrThrow();
  const row = await client.request<Record<string, unknown>>(
    `/monetization/payments/${encodeURIComponent(paymentId)}/proof`,
    {
      method: "POST",
      body: JSON.stringify({ proofUrl, proofNote: proofNote ?? "" }),
    },
  );
  return mapPayment(row);
}

export async function listMyMonetizationPaymentsBackend(
  page = 0,
  size = 20,
): Promise<MonetizationPayment[]> {
  const client = clientOrThrow();
  const data = await client.request<{ items?: unknown[]; content?: unknown[] }>(
    "/monetization/payments",
    { query: { page, size } },
  );
  const rows = data.items ?? data.content ?? [];
  return rows
    .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
    .map(mapPayment);
}
