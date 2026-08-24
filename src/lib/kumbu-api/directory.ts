import { getKumbuApiClient } from "@/lib/kumbu-api/client";

export type DirectorySuggestType = "brand" | "item" | "variant";

export type DirectorySpec = {
  attributeKey: string;
  displayName: string;
  value: string;
  unit?: string | null;
};

export type DirectorySuggestItem = {
  id: string;
  name: string;
  type: DirectorySuggestType;
  brandId?: string | null;
  brandName?: string | null;
  categoryGroup?: string | null;
  status?: string | null;
  sourceType?: string | null;
  specs?: DirectorySpec[];
};

export type DirectorySuggestResponse = {
  items: DirectorySuggestItem[];
  canCreateManual: boolean;
};

type SuggestParams = {
  type: DirectorySuggestType;
  q: string;
  categoryId?: string;
  brand?: string;
  brandId?: string;
  lang?: string;
  limit?: number;
};

function clientOrNull() {
  return getKumbuApiClient();
}

export async function suggestDirectory(params: SuggestParams): Promise<DirectorySuggestResponse> {
  const client = clientOrNull();
  if (!client) return { items: [], canCreateManual: params.q.trim().length >= 2 };
  const row = await client.request<DirectorySuggestResponse>("/catalog/directory/suggest", {
    auth: false,
    query: {
      type: params.type,
      q: params.q,
      categoryId: params.categoryId,
      brand: params.brand,
      brandId: params.brandId,
      lang: params.lang ?? "pt",
      limit: params.limit ?? 12,
    },
  });
  return {
    items: row?.items ?? [],
    canCreateManual: row?.canCreateManual ?? params.q.trim().length >= 2,
  };
}

export async function createDirectoryBrandManual(input: {
  name: string;
  categoryId?: string;
}): Promise<DirectorySuggestItem> {
  const client = clientOrNull();
  if (!client) throw new Error("API backend não configurada.");
  return client.request<DirectorySuggestItem>("/catalog/directory/brands/manual", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createDirectoryItemManual(input: {
  name: string;
  brand?: string;
  brandId?: string;
  categoryId?: string;
  subcategoryId?: string;
}): Promise<DirectorySuggestItem> {
  const client = clientOrNull();
  if (!client) throw new Error("API backend não configurada.");
  return client.request<DirectorySuggestItem>("/catalog/directory/products/manual", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
