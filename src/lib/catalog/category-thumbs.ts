/** Photo thumbs for category tiles (public/categories/{id}.webp). */
/* alimentacao: food category thumb */

const THUMB_BY_ID: Record<string, string> = {
  eletronicos: "/categories/eletronicos.webp",
  telemoveis: "/categories/telemoveis.webp",
  moda: "/categories/moda.webp",
  eletrodomesticos: "/categories/eletrodomesticos.webp",
  beleza: "/categories/beleza.webp",
  moveis: "/categories/moveis.webp",
  carros: "/categories/carros.webp",
  desporto: "/categories/desporto.webp",
  servicos: "/categories/servicos.webp",
  imoveis: "/categories/imoveis.webp",
  emprego: "/categories/emprego.webp",
  empregos: "/categories/empregos.webp",
  restaurantes: "/categories/restaurantes.webp",
  alimentacao: "/categories/alimentacao.webp",
};

export function getCategoryThumbSrc(id: string, name?: string): string | null {
  if (THUMB_BY_ID[id]) return THUMB_BY_ID[id];
  if (!name) return null;
  const key = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
  if (key.includes("moda") || key.includes("fashion")) return THUMB_BY_ID.moda;
  if (key.includes("electro") || key.includes("eletron") || key.includes("telefon")) {
    return THUMB_BY_ID.eletronicos;
  }
  if (key.includes("eletrodomest")) return THUMB_BY_ID.eletrodomesticos;
  if (key.includes("belez") || key.includes("beauty")) return THUMB_BY_ID.beleza;
  if (key.includes("move") || key.includes("furnit")) return THUMB_BY_ID.moveis;
  if (key.includes("carro") || key.includes("veicul") || key.includes("mota")) {
    return THUMB_BY_ID.carros;
  }
  if (key.includes("desport") || key.includes("sport")) return THUMB_BY_ID.desporto;
  if (key.includes("servic")) return THUMB_BY_ID.servicos;
  if (key.includes("imovel") || key.includes("casa") || key.includes("quarto")) {
    return THUMB_BY_ID.imoveis;
  }
  if (key.includes("empreg") || key.includes("job") || key.includes("vaga")) {
    return THUMB_BY_ID.emprego;
  }
  if (key.includes("restaur") || key.includes("comida") || key.includes("food") || key.includes("aliment")) {
    return THUMB_BY_ID.alimentacao;
  }
  return null;
}
