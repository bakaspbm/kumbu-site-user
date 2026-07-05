import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Emprego e vagas",
  description: "Vagas de emprego em Angola — candidate-se directamente no Kumbú.",
  path: "/emprego",
});

export default function EmpregoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
