/** Províncias e municípios de Angola (divisão clássica — 18 províncias). */
export const ANGOLA_PROVINCES = [
  "Bengo",
  "Benguela",
  "Bié",
  "Cabinda",
  "Cuando Cubango",
  "Cuanza Norte",
  "Cuanza Sul",
  "Cunene",
  "Huambo",
  "Huíla",
  "Luanda",
  "Lunda Norte",
  "Lunda Sul",
  "Malange",
  "Moxico",
  "Namibe",
  "Uíge",
  "Zaire",
] as const;

export type AngolaProvince = (typeof ANGOLA_PROVINCES)[number];

export const ANGOLA_MUNICIPALITIES: Record<AngolaProvince, readonly string[]> = {
  Bengo: [
    "Ambriz",
    "Bula Atumba",
    "Dande",
    "Dembos",
    "Nambuangongo",
    "Pango Aluquém",
  ],
  Benguela: [
    "Baía Farta",
    "Balombo",
    "Benguela",
    "Bocoio",
    "Caimbambo",
    "Catumbela",
    "Chongorói",
    "Cubal",
    "Ganda",
    "Lobito",
  ],
  Bié: [
    "Andulo",
    "Camacupa",
    "Catabola",
    "Chinguar",
    "Chitembo",
    "Cuemba",
    "Cunhinga",
    "Cuíto",
    "N'harea",
  ],
  Cabinda: ["Belize", "Buco-Zau", "Cabinda", "Cacongo"],
  "Cuando Cubango": [
    "Calai",
    "Cuangar",
    "Cuchi",
    "Cuito Cuanavale",
    "Dirico",
    "Mavinga",
    "Menongue",
    "Nancova",
    "Rivungo",
  ],
  "Cuanza Norte": [
    "Ambaca",
    "Banga",
    "Bolongongo",
    "Cambambe",
    "Cazengo",
    "Golungo Alto",
    "Gonguembo",
    "Lucala",
    "N'dalatando",
    "Quiculungo",
    "Samba Cajú",
  ],
  "Cuanza Sul": [
    "Amboim",
    "Cassongue",
    "Cela",
    "Conda",
    "Ebo",
    "Libolo",
    "Mussende",
    "Porto Amboim",
    "Quibala",
    "Quilenda",
    "Seles",
    "Sumbe",
  ],
  Cunene: ["Cahama", "Cuanhama", "Curoca", "Cuvelai", "Namacunde", "Ombadja"],
  Huambo: [
    "Bailundo",
    "Caála",
    "Catchiungo",
    "Ecunha",
    "Huambo",
    "Londuimbale",
    "Longonjo",
    "Mungo",
    "Tchicala-Tcholoanga",
    "Tchindjenje",
    "Ukuma",
  ],
  Huíla: [
    "Caconda",
    "Cacula",
    "Caluquembe",
    "Chiange",
    "Chibia",
    "Chicomba",
    "Chipindo",
    "Cuvango",
    "Humpata",
    "Jamba",
    "Lubango",
    "Matala",
    "Quilengues",
    "Quipungo",
  ],
  Luanda: [
    "Belas",
    "Cacuaco",
    "Cazenga",
    "Ícolo e Bengo",
    "Luanda",
    "Quilamba Quiaxi",
    "Quissama",
    "Talatona",
    "Viana",
  ],
  "Lunda Norte": [
    "Cambulo",
    "Capenda-Camulemba",
    "Caungula",
    "Chitato",
    "Cuango",
    "Cuilo",
    "Lóvua",
    "Lubalo",
    "Lucapa",
    "Xá-Muteba",
  ],
  "Lunda Sul": ["Cacolo", "Dala", "Muconda", "Saurimo"],
  Malange: [
    "Cacuso",
    "Calandula",
    "Cambundi-Catembo",
    "Cangandala",
    "Caombo",
    "Cuaba Nzogo",
    "Cuilo",
    "Cunda-Dia-Baze",
    "Luquembo",
    "Malanje",
    "Marimba",
    "Massango",
    "Mucari",
    "Quela",
    "Quirima",
  ],
  Moxico: [
    "Alto Zambeze",
    "Camanongue",
    "Cameia",
    "Leua",
    "Luau",
    "Luacano",
    "Luena",
    "Luchazes",
    "Lumbala N'guimbo",
  ],
  Namibe: ["Bibala", "Camucuio", "Namibe", "Tômbua"],
  Uíge: [
    "Ambuila",
    "Bembe",
    "Buengas",
    "Bungo",
    "Cangola",
    "Damba",
    "Maquela do Zombo",
    "Milunga",
    "Mucaba",
    "Negage",
    "Puri",
    "Quimbele",
    "Quitexe",
    "Sanza Pombo",
    "Songo",
    "Uíge",
  ],
  Zaire: ["Cuimba", "Mbanza Kongo", "Nóqui", "N'Zeto", "Soyo", "Tomboco"],
};

export function listAngolaProvinces(): readonly string[] {
  return ANGOLA_PROVINCES;
}

export function listAngolaMunicipalities(province: string): readonly string[] {
  if (!province) return [];
  const key = ANGOLA_PROVINCES.find((p) => p === province) as AngolaProvince | undefined;
  if (!key) return [];
  return ANGOLA_MUNICIPALITIES[key] ?? [];
}

export function isAngolaProvince(value: string): value is AngolaProvince {
  return (ANGOLA_PROVINCES as readonly string[]).includes(value);
}

export function formatAngolaLocation(municipality: string, province: string): string {
  return [municipality.trim(), province.trim()].filter(Boolean).join(", ");
}

/** Mantém valor guardado antes das listas (texto livre) como opção extra. */
export function municipalityOptionsForProvince(
  province: string,
  currentValue?: string | null,
): string[] {
  const base = [...listAngolaMunicipalities(province)];
  const cur = currentValue?.trim();
  if (cur && !base.includes(cur)) base.unshift(cur);
  return base;
}
