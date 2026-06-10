import { ShoppingBag, Star } from "lucide-react";
import { ListingImage } from "@/components/ui/listing-image";
import { BackHeader } from "@/components/layout/back-header";
import { ProductActions } from "@/components/store/product-actions";
import { demoProducts } from "@/lib/store/demo-data";
import { getCatalogProduct } from "@/lib/site-data";
import { productCoverUrl } from "@/lib/store/product-images";
import { productPlaceholderStyle } from "@/lib/utils";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  let product = demoProducts.find((p) => p.id === id) ?? null;

  try {
    product = await getCatalogProduct(id);
  } catch {
    /* mantém demo/fallback */
  }

  if (!product) notFound();

  const cover = productCoverUrl(product);

  return (
    <article className="min-h-full">
      <BackHeader title={product.title} />

      <section className="kumbu-container py-6 md:py-10">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2 md:gap-10">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-black/8 bg-kumbu-surface shadow-md">
            {cover ? (
              <ListingImage src={cover} alt={product.title} fill priority />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={productPlaceholderStyle(product.imageColor)}
              >
                <ShoppingBag className="size-20 text-white/70" aria-hidden />
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              {product.title}
            </h1>
            <p className="mt-3 text-3xl font-extrabold text-kumbu-primary">
              {product.priceLabel}
            </p>
            {product.rating != null && (
              <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-kumbu-muted">
                <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden />
                {product.rating.toFixed(1)} avaliação
              </p>
            )}
            {product.isOutOfStock && (
              <span className="mt-3 inline-flex w-fit rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                Esgotado
              </span>
            )}
            {product.description && (
              <aside className="mt-6 rounded-2xl border border-black/8 bg-kumbu-surface p-4">
                <h2 className="text-sm font-bold text-kumbu-foreground">Descrição</h2>
                <p className="mt-2 text-sm leading-relaxed text-kumbu-muted">
                  {product.description}
                </p>
              </aside>
            )}
            <div className="mt-8">
              <ProductActions product={product} />
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
