import type { Metadata } from "next";
import { ProductDetailView } from "@/components/store/product-detail-view";
import { JsonLd } from "@/lib/seo/json-ld";
import { buildProductMetadata } from "@/lib/seo/metadata";
import { buildListingJsonLd } from "@/lib/seo/structured-data";
import { getCachedProduct } from "@/lib/store/catalog-cache";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getCachedProduct(id);
  if (!product) {
    return { title: "Anúncio" };
  }
  return buildProductMetadata(product);
}

export default async function ProdutoPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getCachedProduct(id);

  return (
    <>
      {product ? <JsonLd data={buildListingJsonLd(product)} /> : null}
      <ProductDetailView productId={id} />
    </>
  );
}
