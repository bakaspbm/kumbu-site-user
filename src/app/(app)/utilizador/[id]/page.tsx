import { SellerPageClient } from "@/components/store/seller-page-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UtilizadorPublicoPage({ params }: PageProps) {
  const { id } = await params;
  return <SellerPageClient sellerId={id} />;
}
