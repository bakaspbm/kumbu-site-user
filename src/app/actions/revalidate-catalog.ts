"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateHomeCatalog() {
  revalidateTag("catalog-bootstrap");
  revalidatePath("/");
  revalidatePath("/procurar");
  revalidatePath("/categorias");
  revalidatePath("/conta/anuncios");
  revalidatePath("/produto", "layout");
}
