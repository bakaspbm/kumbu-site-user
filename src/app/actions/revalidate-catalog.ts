"use server";

import { getServerSessionUserId } from "@/lib/server-auth";
import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateHomeCatalog() {
  const userId = await getServerSessionUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  revalidateTag("catalog-bootstrap");
  revalidatePath("/");
  revalidatePath("/procurar");
  revalidatePath("/categorias");
  revalidatePath("/conta/anuncios");
  revalidatePath("/produto", "layout");
}
