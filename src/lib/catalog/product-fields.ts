
export type ProductFieldType = "text" | "select" | "number";

export interface ProductFieldDef {
  key: string;
  label: string;
  type: ProductFieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
}

export const CONDITION_OPTIONS = [
  { value: "novo", label: "Novo" },
  { value: "usado_como_novo", label: "Usado — como novo" },
  { value: "usado_bom", label: "Usado — bom estado" },
  { value: "usado_aceitavel", label: "Usado — aceitável" },
] as const;

const cond = (): ProductFieldDef => ({
  key: "condition",
  label: "Estado",
  type: "select",
  options: [...CONDITION_OPTIONS],
  required: true,
});

function furnitureFields(placeholder: string): ProductFieldDef[] {
  return [
    {
      key: "productType",
      label: "Tipo de móvel",
      type: "text",
      required: true,
      placeholder,
    },
    {
      key: "material",
      label: "Material",
      type: "text",
      placeholder: "Ex.: Madeira, metal, tecido",
    },
    {
      key: "dimensions",
      label: "Dimensões",
      type: "text",
      placeholder: "Ex.: 200×90 cm (opcional)",
    },
    cond(),
  ];
}

function vehicleFields(extra: ProductFieldDef[] = []): ProductFieldDef[] {
  return [
    { key: "brand", label: "Marca", type: "text", required: true, placeholder: "Ex.: Toyota, Hyundai" },
    { key: "model", label: "Modelo", type: "text", required: true, placeholder: "Ex.: Corolla, Tucson" },
    { key: "year", label: "Ano", type: "number", required: true, placeholder: "2020" },
    ...extra,
    cond(),
  ];
}

const brand = (ph = "Ex.: Samsung"): ProductFieldDef => ({
  key: "brand",
  label: "Marca",
  type: "text",
  required: true,
  placeholder: ph,
});

const FIELDS: Record<string, ProductFieldDef[]> = {
  "eletronicos:telefones": [
    brand(),
    { key: "model", label: "Modelo", type: "text", required: true, placeholder: "Ex.: Galaxy A54" },
    {
      key: "storage",
      label: "Armazenamento",
      type: "select",
      required: true,
      options: [
        { value: "32", label: "32 GB" },
        { value: "64", label: "64 GB" },
        { value: "128", label: "128 GB" },
        { value: "256", label: "256 GB" },
        { value: "512", label: "512 GB ou mais" },
      ],
    },
    cond(),
    { key: "color", label: "Cor", type: "text", placeholder: "Opcional" },
  ],
  "eletronicos:computadores": [
    brand("Ex.: HP, Dell, Apple"),
    { key: "model", label: "Modelo", type: "text", required: true, placeholder: "Ex.: Pavilion 15, MacBook Air" },
    { key: "processor", label: "Processador", type: "text", required: true, placeholder: "Ex.: Intel i5, M1" },
    {
      key: "ram",
      label: "RAM",
      type: "select",
      required: true,
      options: [
        { value: "4", label: "4 GB" },
        { value: "8", label: "8 GB" },
        { value: "16", label: "16 GB" },
        { value: "32", label: "32 GB ou mais" },
      ],
    },
    {
      key: "storage",
      label: "Armazenamento",
      type: "select",
      required: true,
      options: [
        { value: "256", label: "256 GB" },
        { value: "512", label: "512 GB" },
        { value: "1024", label: "1 TB ou mais" },
      ],
    },
    { key: "screen", label: 'Ecrã (")', type: "text", placeholder: "Ex.: 15.6" },
    cond(),
  ],
  "eletronicos:tablets": [
    brand("Ex.: Apple, Samsung, Lenovo"),
    { key: "model", label: "Modelo", type: "text", required: true, placeholder: "Ex.: iPad Air, Tab S9" },
    {
      key: "storage",
      label: "Armazenamento",
      type: "select",
      options: [
        { value: "64", label: "64 GB" },
        { value: "128", label: "128 GB" },
        { value: "256", label: "256 GB ou mais" },
      ],
    },
    cond(),
  ],
  "eletronicos:tv-audio": [
    brand("Ex.: Samsung, LG, Sony"),
    { key: "model", label: "Modelo", type: "text", placeholder: "Ex.: AU8000, OLED C3" },
    {
      key: "screenSize",
      label: "Tamanho",
      type: "text",
      placeholder: 'Ex.: 55" TV, coluna Bluetooth',
    },
    cond(),
  ],
  "eletronicos:gaming": [
    brand("Ex.: Sony, Microsoft, Nintendo"),
    {
      key: "model",
      label: "Modelo / consola",
      type: "text",
      required: true,
      placeholder: "Ex.: PS5, Xbox Series S",
    },
    cond(),
  ],
  "eletronicos:acessorios": [
    { key: "productType", label: "Tipo", type: "text", required: true, placeholder: "Ex.: Carregador, auricular" },
    brand(),
    cond(),
  ],
  "moda:roupas": [
    {
      key: "gender",
      label: "Para",
      type: "select",
      options: [
        { value: "homem", label: "Homem" },
        { value: "mulher", label: "Mulher" },
        { value: "crianca", label: "Criança" },
        { value: "unissexo", label: "Unissexo" },
      ],
    },
    { key: "size", label: "Tamanho", type: "text", required: true, placeholder: "Ex.: M, 42, 10 anos" },
    brand("Ex.: Zara, local"),
    { key: "color", label: "Cor", type: "text" },
    cond(),
  ],
  "moda:sapatos": [
    {
      key: "gender",
      label: "Para",
      type: "select",
      options: [
        { value: "homem", label: "Homem" },
        { value: "mulher", label: "Mulher" },
        { value: "crianca", label: "Criança" },
        { value: "unissexo", label: "Unissexo" },
      ],
    },
    { key: "size", label: "Número / tamanho", type: "text", required: true, placeholder: "Ex.: 42, 38" },
    brand(),
    cond(),
  ],
  "moda:acessorios": [
    { key: "productType", label: "Tipo", type: "text", required: true, placeholder: "Ex.: Mala, cinto, relógio" },
    brand(),
    cond(),
  ],
  "eletrodomesticos:cozinha": [
    { key: "productType", label: "Tipo", type: "text", required: true, placeholder: "Ex.: Micro-ondas, fogão" },
    brand(),
    cond(),
  ],
  "eletrodomesticos:frigorificos": [
    brand(),
    { key: "capacity", label: "Capacidade", type: "text", placeholder: "Ex.: 350 L" },
    cond(),
  ],
  "eletrodomesticos:lavagem": [
    brand(),
    { key: "capacity", label: "Capacidade de carga", type: "text", placeholder: "Ex.: 8 kg" },
    cond(),
  ],
  "eletrodomesticos:climatizacao": [
    brand(),
    { key: "power", label: "Potência / BTU", type: "text", placeholder: "Ex.: 12000 BTU" },
    cond(),
  ],
  "eletrodomesticos:outros": [brand(), cond()],
  "beleza:maquilhagem": [
    brand("Ex.: MAC, Maybelline"),
    { key: "productType", label: "Tipo", type: "text", required: true, placeholder: "Ex.: Batom, base" },
    cond(),
  ],
  "beleza:cuidados": [
    brand(),
    { key: "volume", label: "Volume / quantidade", type: "text", placeholder: "Ex.: 250 ml" },
    cond(),
  ],
  "beleza:perfumes": [
    brand(),
    { key: "volume", label: "Volume", type: "text", placeholder: "Ex.: 100 ml" },
    cond(),
  ],
  "beleza:outros": [
    { key: "productType", label: "Tipo", type: "text", required: true, placeholder: "Ex.: Unhas, acessório" },
    brand(),
    cond(),
  ],
  "moveis:sala": furnitureFields("Ex.: Sofá, mesa de centro, estante"),
  "moveis:quarto": furnitureFields("Ex.: Cama, roupeiro, criado-mudo"),
  "moveis:cozinha": furnitureFields("Ex.: Mesa, cadeiras, armário"),
  "moveis:escritorio": furnitureFields("Ex.: Secretária, cadeira, arquivo"),
  "moveis:exterior": furnitureFields("Ex.: Conjunto jardim, espreguiçadeira"),
  "carros:ligeiros": vehicleFields([
    { key: "mileage", label: "Quilómetros", type: "number", placeholder: "Ex.: 85000" },
    {
      key: "fuel",
      label: "Combustível",
      type: "select",
      required: true,
      options: [
        { value: "gasolina", label: "Gasolina" },
        { value: "diesel", label: "Diesel" },
        { value: "hibrido", label: "Híbrido" },
        { value: "eletrico", label: "Eléctrico" },
      ],
    },
    { key: "transmission", label: "Caixa", type: "select", options: [
      { value: "manual", label: "Manual" },
      { value: "automatica", label: "Automática" },
    ]},
  ]),
  "carros:suv": vehicleFields([
    { key: "mileage", label: "Quilómetros", type: "number", placeholder: "Ex.: 120000" },
    {
      key: "fuel",
      label: "Combustível",
      type: "select",
      options: [
        { value: "gasolina", label: "Gasolina" },
        { value: "diesel", label: "Diesel" },
        { value: "hibrido", label: "Híbrido" },
      ],
    },
  ]),
  "carros:comerciais": vehicleFields([
    { key: "mileage", label: "Quilómetros", type: "number" },
    {
      key: "fuel",
      label: "Combustível",
      type: "select",
      options: [
        { value: "gasolina", label: "Gasolina" },
        { value: "diesel", label: "Diesel" },
      ],
    },
    {
      key: "payload",
      label: "Carga útil",
      type: "text",
      placeholder: "Ex.: 1,5 t (opcional)",
    },
  ]),
  "carros:motas": [
    { key: "brand", label: "Marca", type: "text", required: true, placeholder: "Ex.: Honda, Yamaha" },
    { key: "model", label: "Modelo", type: "text", required: true, placeholder: "Ex.: PCX, FZ25" },
    { key: "year", label: "Ano", type: "number" },
    { key: "engine", label: "Cilindrada", type: "text", placeholder: "Ex.: 125 cc" },
    cond(),
  ],
  "carros:pecas": [
    {
      key: "productType",
      label: "Tipo de peça",
      type: "text",
      required: true,
      placeholder: "Ex.: Faróis, pneus, alternador",
    },
    { key: "compatible", label: "Compatível com", type: "text", placeholder: "Ex.: Toyota Corolla 2018" },
    cond(),
  ],
  "desporto:fitness": [
    {
      key: "productType",
      label: "Equipamento",
      type: "text",
      required: true,
      placeholder: "Ex.: Passadeira, halteres, banco",
    },
    brand(),
    cond(),
  ],
  "desporto:futebol": [
    { key: "productType", label: "Artigo", type: "text", required: true, placeholder: "Ex.: Bola, chuteiras" },
    { key: "size", label: "Tamanho", type: "text" },
    cond(),
  ],
  "desporto:ciclismo": [
    {
      key: "productType",
      label: "Artigo",
      type: "text",
      required: true,
      placeholder: "Ex.: Bicicleta, capacete, luzes",
    },
    brand(),
    cond(),
  ],
  "desporto:outros": [
    {
      key: "productType",
      label: "Artigo",
      type: "text",
      required: true,
      placeholder: "Ex.: Raquete, skate, equipamento ginásio",
    },
    cond(),
  ],
  "servicos:reparacao": [
    { key: "serviceArea", label: "Área", type: "text", required: true, placeholder: "Ex.: Informática, canalização" },
    { key: "coverage", label: "Zona de atendimento", type: "text", placeholder: "Ex.: Luanda" },
  ],
  "servicos:limpeza": [
    { key: "serviceType", label: "Tipo", type: "text", required: true, placeholder: "Ex.: Doméstica, escritório" },
    { key: "coverage", label: "Zona", type: "text" },
  ],
  "servicos:transporte": [
    { key: "serviceType", label: "Serviço", type: "text", required: true, placeholder: "Ex.: Mudanças, entregas" },
    { key: "coverage", label: "Zona", type: "text" },
  ],
  "servicos:educacao": [
    {
      key: "subject",
      label: "Disciplina / área",
      type: "text",
      required: true,
      placeholder: "Ex.: Matemática, inglês, informática",
    },
    { key: "modality", label: "Modalidade", type: "select", options: [
      { value: "presencial", label: "Presencial" },
      { value: "online", label: "Online" },
      { value: "ambos", label: "Presencial e online" },
    ]},
  ],
  "servicos:outros": [
    {
      key: "serviceType",
      label: "Tipo de serviço",
      type: "text",
      required: true,
      placeholder: "Ex.: Eventos, fotografia, consultoria",
    },
  ],
};

const CATEGORY_DEFAULTS: Record<string, ProductFieldDef[]> = {
  eletronicos: [
    brand(),
    { key: "model", label: "Modelo", type: "text", placeholder: "Ex.: modelo ou referência" },
    cond(),
  ],
  moda: [
    {
      key: "productType",
      label: "Tipo",
      type: "text",
      required: true,
      placeholder: "Ex.: Casaco, calças, vestido",
    },
    brand(),
    cond(),
  ],
  eletrodomesticos: [
    {
      key: "productType",
      label: "Tipo",
      type: "text",
      required: true,
      placeholder: "Ex.: Frigorífico, máquina de lavar",
    },
    brand(),
    cond(),
  ],
  beleza: [
    brand(),
    {
      key: "productType",
      label: "Tipo",
      type: "text",
      required: true,
      placeholder: "Ex.: Creme, perfume, maquilhagem",
    },
    cond(),
  ],
  moveis: furnitureFields("Ex.: Indique o móvel"),
  carros: vehicleFields(),
  desporto: [
    {
      key: "productType",
      label: "Artigo",
      type: "text",
      required: true,
      placeholder: "Ex.: Equipamento ou roupa desportiva",
    },
    brand(),
    cond(),
  ],
  servicos: [
    {
      key: "serviceType",
      label: "Tipo de serviço",
      type: "text",
      required: true,
      placeholder: "Ex.: Descreva o que oferece",
    },
    { key: "coverage", label: "Zona de atendimento", type: "text", placeholder: "Ex.: Luanda, Talatona" },
  ],
};

export function getProductFields(
  categoryId: string,
  subcategoryId?: string | null,
): ProductFieldDef[] {
  if (subcategoryId) {
    const key = `${categoryId}:${subcategoryId}`;
    if (FIELDS[key]) return FIELDS[key];
  }
  return CATEGORY_DEFAULTS[categoryId] ?? [
    { key: "productType", label: "Tipo", type: "text", required: true },
    cond(),
  ];
}

export function getSubcategoryFieldLabel(categoryId: string): string {
  const labels: Record<string, string> = {
    eletronicos: "Tipo de electrónico",
    moda: "Tipo de artigo",
    eletrodomesticos: "Tipo de eletrodoméstico",
    beleza: "Tipo de produto de beleza",
    moveis: "Divisão / tipo de móvel",
    carros: "Tipo de veículo",
    desporto: "Modalidade desportiva",
    servicos: "Tipo de serviço",
  };
  return labels[categoryId] ?? "Subcategoria";
}

function resolveCategoryHint(
  categoryId: string,
  subcategoryId: string | null | undefined,
  bySub: Record<string, string>,
  byCategory: Record<string, string>,
  fallback: string,
): string {
  if (subcategoryId) {
    const key = `${categoryId}:${subcategoryId}`;
    if (bySub[key]) return bySub[key];
  }
  return byCategory[categoryId] ?? fallback;
}

const TITLE_BY_SUB: Record<string, string> = {
  "eletronicos:telefones":
    "Ex.: Samsung Galaxy A54 — 128 GB, bateria boa",
  "eletronicos:computadores":
    'Ex.: Portátil HP 15" — Intel i5, 8 GB RAM, SSD 256 GB',
  "eletronicos:tablets": "Ex.: iPad 10ª geração — 64 GB, com capa",
  "eletronicos:tv-audio":
    'Ex.: Samsung Smart TV 55" 4K — com comando e suporte',
  "eletronicos:gaming": "Ex.: PlayStation 5 — 2 comandos e 3 jogos",
  "eletronicos:acessorios": "Ex.: Auriculares JBL Bluetooth — pouco uso",
  "moda:roupas": "Ex.: Vestido de festa tam. M — usado 1 vez",
  "moda:sapatos": "Ex.: Ténis Nike tam. 42 — como novos",
  "moda:acessorios": "Ex.: Mala de senhora — couro, cor bege",
  "eletrodomesticos:cozinha": "Ex.: Micro-ondas Samsung 20 L — funciona bem",
  "eletrodomesticos:frigorificos": "Ex.: Frigorífico combinado 350 L — classe A",
  "eletrodomesticos:lavagem": "Ex.: Máquina lavar 8 kg — poucos anos",
  "eletrodomesticos:climatizacao": "Ex.: Ar condicionado 12000 BTU — com instalação",
  "eletrodomesticos:outros": "Ex.: Ferro a vapor Philips — novo na caixa",
  "beleza:maquilhagem": "Ex.: Kit maquilhagem MAC — pouco usado",
  "beleza:cuidados": "Ex.: Creme hidratante 250 ml — selado",
  "beleza:perfumes": "Ex.: Perfume importado 100 ml — com caixa",
  "beleza:outros": "Ex.: Secador de cabelo profissional",
  "moveis:sala": "Ex.: Sofá 3 lugares — tecido cinza, bom estado",
  "moveis:quarto": "Ex.: Cama casal + colchão — madeira maciça",
  "moveis:cozinha": "Ex.: Mesa jantar 6 lugares + cadeiras",
  "moveis:escritorio": "Ex.: Secretária com gavetas — 120×60 cm",
  "moveis:exterior": "Ex.: Conjunto jardim 4 lugares — resistente ao sol",
  "carros:ligeiros": "Ex.: Toyota Corolla 2018 — 85 000 km, revisões em dia",
  "carros:suv": "Ex.: Toyota RAV4 2019 diesel — 4×4, automático",
  "carros:comerciais": "Ex.: Hiace 2017 — 15 lugares, bom para transporte",
  "carros:motas": "Ex.: Honda PCX 125 — 2021, documentação em dia",
  "carros:pecas": "Ex.: Faróis dianteiros Toyota Corolla 2015–2018",
  "desporto:fitness": "Ex.: Passadeira eléctrica — pouco uso",
  "desporto:futebol": "Ex.: Chuteiras Nike tam. 43 — 1 temporada",
  "desporto:ciclismo": "Ex.: Bicicleta montanha 21 velocidades",
  "desporto:outros": "Ex.: Raquete ténis Wilson — com capa",
  "servicos:reparacao": "Ex.: Reparação de telemóveis e tablets — Luanda",
  "servicos:limpeza": "Ex.: Limpeza doméstica semanal — Talatona",
  "servicos:transporte": "Ex.: Mudanças e entregas — camião 3,5 t",
  "servicos:educacao": "Ex.: Aulas de inglês — presencial ou online",
  "servicos:outros": "Ex.: Montagem de móveis — orçamento grátis",
};

const TITLE_BY_CATEGORY: Record<string, string> = {
  eletronicos: "Ex.: Marca, modelo e estado do equipamento",
  moda: "Ex.: Artigo, tamanho e estado (ex.: casaco M, bom estado)",
  eletrodomesticos: "Ex.: Marca, modelo e estado do aparelho",
  beleza: "Ex.: Produto, marca e quantidade",
  moveis: "Ex.: Tipo de móvel, material e dimensões aproximadas",
  carros: "Ex.: Marca, modelo, ano e quilómetros",
  desporto: "Ex.: Equipamento ou artigo desportivo",
  servicos: "Ex.: Nome claro do serviço e zona de atendimento",
};

const DESCRIPTION_BY_SUB: Record<string, string> = {
  "eletronicos:telefones":
    "Bateria, acessórios incluídos, garantia, entrega ou recolha…",
  "eletronicos:tv-audio":
    "Acessórios (comando, cabos), ano de compra, entrega, negociação…",
  "carros:ligeiros": "Histórico, revisões, acidentes, documentação, test drive…",
  "servicos:reparacao": "Horário, deslocação ao domicílio, garantia do serviço…",
};

const DESCRIPTION_BY_CATEGORY: Record<string, string> = {
  eletronicos: "Garantia, factura, entrega, troca ou negociação…",
  moda: "Medidas exactas, defeitos, lavagens, entrega…",
  eletrodomesticos: "Consumo energético, instalação, garantia, entrega…",
  carros: "Inspecção, multas, financiamento, documentação…",
  servicos: "Horário, preço por hora ou pacote, zona coberta…",
  moveis: "Montagem, entrega, dimensões exactas, material…",
};

export function getTitlePlaceholder(
  categoryId: string,
  subcategoryId?: string | null,
): string {
  return resolveCategoryHint(
    categoryId,
    subcategoryId,
    TITLE_BY_SUB,
    TITLE_BY_CATEGORY,
    "Ex.: Descreva o artigo com marca, modelo e estado",
  );
}

export function getDescriptionPlaceholder(
  categoryId: string,
  subcategoryId?: string | null,
): string {
  return resolveCategoryHint(
    categoryId,
    subcategoryId,
    DESCRIPTION_BY_SUB,
    DESCRIPTION_BY_CATEGORY,
    "Detalhes extra: garantia, entrega, negociação…",
  );
}

export function hasDescriptionBySub(
  categoryId: string,
  subcategoryId: string,
): boolean {
  return `${categoryId}:${subcategoryId}` in DESCRIPTION_BY_SUB;
}

export function hasDescriptionByCategory(categoryId: string): boolean {
  return categoryId in DESCRIPTION_BY_CATEGORY;
}

export function hasTitleBySub(categoryId: string, subcategoryId: string): boolean {
  return `${categoryId}:${subcategoryId}` in TITLE_BY_SUB;
}

export function hasTitleByCategory(categoryId: string): boolean {
  return categoryId in TITLE_BY_CATEGORY;
}

export function getLocationPlaceholder(categoryId: string): string {
  if (categoryId === "servicos") {
    return "Ex.: Luanda — zona onde presta o serviço";
  }
  if (categoryId === "carros") {
    return "Ex.: Luanda (local da viatura)";
  }
  return "Ex.: Luanda, Talatona";
}

export function getPricePlaceholder(
  categoryId: string,
  subcategoryId?: string | null,
): string {
  if (categoryId === "carros") return "Ex.: 2 500 000 Kz";
  if (categoryId === "servicos") return "Ex.: 5 000 Kz/hora ou preço fixo";
  if (categoryId === "imoveis") return "Use o formulário de imóvel";
  if (categoryId === "emprego") return "Use o formulário de vaga";
  if (subcategoryId === "telefones") return "Ex.: 85 000 Kz";
  if (subcategoryId === "tv-audio") return "Ex.: 180 000 Kz";
  if (subcategoryId === "computadores") return "Ex.: 350 000 Kz";
  if (categoryId === "eletronicos") return "Ex.: 25 000 Kz";
  return "Ex.: 15 000 Kz";
}

export function getCategoryKindLabel(category: {
  id: string;
  kind: string;
  name?: string;
}): string {
  if (category.id === "emprego" || category.kind === "job") return "Emprego e vagas";
  if (
    category.id === "imoveis" ||
    category.kind === "stay" ||
    category.kind === "property"
  ) {
    return "Imóveis e arrendamento";
  }
  if (category.id === "servicos") return "Serviços";
  return "Produtos à venda";
}

export function validateProductAttributes(
  categoryId: string,
  subcategoryId: string | null | undefined,
  attributes: Record<string, string>,
): string | null {
  const fields = getProductFields(categoryId, subcategoryId);
  for (const f of fields) {
    if (f.required && !attributes[f.key]?.trim()) {
      return `Preencha: ${f.label}`;
    }
  }
  return null;
}

export function buildProductMeta(attributes: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(attributes)) {
    const t = v.trim();
    if (t) out[k] = t;
  }
  return out;
}

const FIELD_LABELS: Record<string, string> = {
  condition: "Estado",
  brand: "Marca",
  model: "Modelo",
  storage: "Armazenamento",
  ram: "RAM",
  processor: "Processador",
  screen: "Ecrã",
  color: "Cor",
  gender: "Para",
  size: "Tamanho",
  productType: "Tipo",
  capacity: "Capacidade",
  power: "Potência",
  volume: "Volume",
  material: "Material",
  year: "Ano",
  mileage: "Quilómetros",
  fuel: "Combustível",
  engine: "Cilindrada",
  compatible: "Compatível com",
  serviceArea: "Área",
  coverage: "Zona",
  serviceType: "Serviço",
  subject: "Disciplina",
  modality: "Modalidade",
  screenSize: "Tamanho",
  dimensions: "Dimensões",
  transmission: "Caixa",
  payload: "Carga útil",
};

const VALUE_LABELS: Record<string, Record<string, string>> = {
  condition: Object.fromEntries(CONDITION_OPTIONS.map((o) => [o.value, o.label])),
  gender: {
    homem: "Homem",
    mulher: "Mulher",
    crianca: "Criança",
    unissexo: "Unissexo",
  },
  fuel: {
    gasolina: "Gasolina",
    diesel: "Diesel",
    hibrido: "Híbrido",
    eletrico: "Eléctrico",
  },
  modality: {
    presencial: "Presencial",
    online: "Online",
    ambos: "Presencial e online",
  },
  transmission: {
    manual: "Manual",
    automatica: "Automática",
  },
  storage: {
    "32": "32 GB",
    "64": "64 GB",
    "128": "128 GB",
    "256": "256 GB",
    "512": "512 GB ou mais",
    "1024": "1 TB ou mais",
  },
  ram: {
    "4": "4 GB",
    "8": "8 GB",
    "16": "16 GB",
    "32": "32 GB ou mais",
  },
};

export function formatProductAttributeLabel(key: string): string {
  return FIELD_LABELS[key] ?? key;
}

export function formatProductAttributeValue(key: string, value: string | number): string {
  const s = String(value);
  return VALUE_LABELS[key]?.[s] ?? s;
}

/** Valores de selects conhecidos (condition, fuel, …) — não texto livre como tamanho "M". */
export function hasPredefinedProductAttributeOption(
  key: string,
  value: string | number,
): boolean {
  return VALUE_LABELS[key]?.[String(value)] != null;
}

export function productMetaEntries(
  meta: Record<string, string | number | boolean | null> | null | undefined,
): { label: string; value: string }[] {
  if (!meta) return [];
  return Object.entries(meta)
    .filter(([, v]) => v != null && String(v).trim() !== "")
    .map(([k, v]) => ({
      label: formatProductAttributeLabel(k),
      value: formatProductAttributeValue(k, v as string | number),
    }));
}
