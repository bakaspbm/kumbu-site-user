"use server";

import { revalidatePath, revalidateTag } from "next/cache";

/** Revalida cache do catálogo. Não exige sessão — o caller já autenticou na API. */
export async function revalidateHomeCatalog() {
  revalidateTag("catalog-bootstrap");
  revalidatePath("/");
  revalidatePath("/procurar");
  revalidatePath("/categorias");
  revalidatePath("/conta/anuncios");
  revalidatePath("/produto", "layout");
}
