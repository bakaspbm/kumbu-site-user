"use server";

import { revalidateHomeCatalog } from "@/app/actions/revalidate-catalog";
import { serverActionError } from "@/lib/i18n/server-errors";
import { serverLoginRequiredError } from "@/lib/i18n/server-errors";
import { createCatalogProduct } from "@/lib/site-data";
import { getServerSessionUserId } from "@/lib/server-auth";
import { publishDebug, publishDebugFail, publishDebugTimer } from "@/lib/publish/publish-debug";
import type { CatalogProductInsert } from "@/types/store";

export type PublishCatalogResult =
  | { ok: true; productId: string }
  | { ok: false; error: string; needsLogin?: boolean };

export async function publishCatalogProductAction(
  input: CatalogProductInsert,
): Promise<PublishCatalogResult> {
  const timer = publishDebugTimer("P1_GRAVAR_ANUNCIO", "insert catalog_products");

  try {
    const userId = await getServerSessionUserId();
    if (!userId) return { ok: false, error: await serverLoginRequiredError(), needsLogin: true };
    const product = await createCatalogProduct(input);
    await revalidateHomeCatalog();
    timer.ok({
      productId: product.id,
      title: input.title?.slice(0, 40),
      listingKind: input.listingKind,
    });
    return { ok: true, productId: product.id };
  } catch (err) {
    timer.fail("erro ao gravar", err, { productId: input.id });
    return { ok: false, error: await serverActionError(err) };
  }
}
