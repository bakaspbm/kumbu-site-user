import { CategoriesPage } from "@/components/store/categories-page";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Categorias",
  description: "Explore categorias de produtos, imóveis e emprego em Angola no Kumbú.",
  path: "/categorias",
});

export default function CategoriasPage() {
  return <CategoriesPage />;
}
