"use client";

import Link from "next/link";
import {
  Briefcase,
  Car,
  ChevronRight,
  Home,
  LayoutGrid,
  Shirt,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import { getCategoryExploreHref } from "@/lib/catalog/category-links";
import type { CatalogCategory } from "@/types/store";

const iconById: Record<string, typeof LayoutGrid> = {
  eletronicos: Smartphone,
  moda: Shirt,
  eletrodomesticos: UtensilsCrossed,
  beleza: Sparkles,
  moveis: Home,
  carros: Car,
  desporto: LayoutGrid,
  servicos: Wrench,
  imoveis: Home,
  emprego: Briefcase,
};

function iconForCategory(id: string, name: string) {
  if (iconById[id]) return iconById[id];
  const key = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
  if (key.includes("moda") || key.includes("fashion")) return Shirt;
  if (key.includes("electro") || key.includes("telefon")) return Smartphone;
  if (key.includes("servic")) return Wrench;
  if (key.includes("carro") || key.includes("veicul")) return Car;
  if (key.includes("imovel") || key.includes("casa")) return Home;
  return LayoutGrid;
}

export function HomeCategoryRow({ categories }: { categories: CatalogCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="kumbu-container py-2 md:py-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="kumbu-section-title">Categorias</h2>
        <Link href="/categorias" className="kumbu-link-pill">
          Ver todas
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
      <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1 scrollbar-none md:grid md:grid-cols-5 md:gap-2.5 md:overflow-visible lg:grid-cols-6">
          {categories.map((c) => {
            const Icon = iconForCategory(c.id, c.name);
            const href = getCategoryExploreHref(c);
            return (
              <Link key={c.id} href={href} className="kumbu-category-tile shrink-0 md:min-w-0">
                <span className="kumbu-category-tile-icon">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="kumbu-category-tile-label text-kumbu-foreground">
                  {c.name}
                </span>
              </Link>
            );
          })}
        </div>
    </section>
  );
}
