import { ProductDetailView } from "@/components/store/product-detail-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProdutoPage({ params }: PageProps) {
  const { id } = await params;
  return <ProductDetailView productId={id} />;
}
