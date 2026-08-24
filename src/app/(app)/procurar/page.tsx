import { Suspense } from "react";
import { ProcurarClient } from "./procurar-client";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Procurar anúncios",
  description: "Pesquise produtos, imóveis e vagas de emprego em Angola no Kumbú.",
  path: "/procurar",
});

export default function ProcurarPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProcurarClient />
    </Suspense>
  );
}
