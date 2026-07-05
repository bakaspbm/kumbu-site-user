import type { Metadata } from "next";
import { SellerPageClient } from "@/components/store/seller-page-client";
import { buildSellerMetadata } from "@/lib/seo/metadata";
import { getPublicSeller } from "@/lib/site-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const seller = await getPublicSeller(id);
    if (seller?.displayName) {
      return buildSellerMetadata(seller.displayName, id);
    }
  } catch {
    /* fallback */
  }
  return buildSellerMetadata("Vendedor", id);
}

export default async function UtilizadorPublicoPage({ params }: PageProps) {
  const { id } = await params;
  return <SellerPageClient sellerId={id} />;
}
