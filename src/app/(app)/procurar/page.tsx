import { ProcurarClient } from "./procurar-client";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Procurar anúncios",
  description: "Pesquise produtos, imóveis e vagas de emprego em Angola no Kumbú.",
  path: "/procurar",
});

export default function ProcurarPage() {
  return <ProcurarClient />;
}
