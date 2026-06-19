import {
  CONDITION_OPTIONS,
  formatProductAttributeLabel,
  formatProductAttributeValue,
  getCategoryKindLabel,
  getDescriptionPlaceholder,
  getPricePlaceholder,
  getSubcategoryFieldLabel,
  getTitlePlaceholder,
  hasDescriptionBySub,
  hasDescriptionByCategory,
  hasTitleBySub,
  hasTitleByCategory,
  hasPredefinedProductAttributeOption,
  type ProductFieldDef,
} from "@/lib/catalog/product-fields";

export type CatalogFieldsTranslateFn = (key: string) => string;

function tf(t: CatalogFieldsTranslateFn, key: string, fallback: string): string {
  try {
    const translated = t(key);
    if (
      !translated ||
      translated === key ||
      translated.startsWith("catalogFields.") ||
      translated.includes("MISSING_MESSAGE")
    ) {
      return fallback;
    }
    return translated;
  } catch {
    return fallback;
  }
}

const LABEL_VARIANT_KEYS: Record<string, string> = {
  Estado: "condition.label",
  "Tipo de móvel": "productType.labelFurniture",
  Material: "material.label",
  Dimensões: "dimensions.label",
  Marca: "brand.label",
  Modelo: "model.label",
  "Modelo / consola": "model.labelConsole",
  Ano: "year.label",
  Armazenamento: "storage.label",
  Cor: "color.label",
  Processador: "processor.label",
  RAM: "ram.label",
  'Ecrã (")': "screen.label",
  Tamanho: "size.label",
  Tipo: "productType.label",
  Para: "gender.label",
  "Número / tamanho": "size.labelShoes",
  Capacidade: "capacity.label",
  "Capacidade de carga": "capacity.labelLaundry",
  "Potência / BTU": "power.label",
  "Volume / quantidade": "volume.labelQuantity",
  Volume: "volume.label",
  Quilómetros: "mileage.label",
  Combustível: "fuel.label",
  Caixa: "transmission.label",
  Cilindrada: "engine.label",
  "Tipo de peça": "productType.labelPiece",
  "Compatível com": "compatible.label",
  Equipamento: "productType.labelEquipment",
  Artigo: "productType.labelArticle",
  Área: "serviceArea.label",
  "Zona de atendimento": "coverage.labelService",
  Zona: "coverage.label",
  Serviço: "serviceType.labelService",
  "Disciplina / área": "subject.label",
  Modalidade: "modality.label",
  "Tipo de serviço": "serviceType.label",
};

const PLACEHOLDER_KEYS: Record<string, string> = {
  "Ex.: Madeira, metal, tecido": "placeholders.material",
  "Ex.: 200×90 cm (opcional)": "placeholders.dimensions",
  "Ex.: Toyota, Hyundai": "placeholders.brandVehicles",
  "Ex.: Corolla, Tucson": "placeholders.modelVehicles",
  "2020": "placeholders.year",
  "Ex.: Samsung": "placeholders.brandDefault",
  "Ex.: HP, Dell, Apple": "placeholders.brandComputer",
  "Ex.: Apple, Samsung, Lenovo": "placeholders.brandTablet",
  "Ex.: Galaxy A54": "placeholders.modelPhone",
  Opcional: "placeholders.optional",
  "Ex.: Pavilion 15, MacBook Air": "placeholders.modelComputer",
  "Ex.: Intel i5, M1": "placeholders.processor",
  "Ex.: 15.6": "placeholders.screen",
  "Ex.: iPad Air, Tab S9": "placeholders.modelTablet",
  "Ex.: AU8000, OLED C3": "placeholders.modelTv",
  'Ex.: 55" TV, coluna Bluetooth': "placeholders.screenSize",
  "Ex.: PS5, Xbox Series S": "placeholders.modelGaming",
  "Ex.: Carregador, auricular": "placeholders.productTypeAccessory",
  "Ex.: M, 42, 10 anos": "placeholders.sizeClothing",
  "Ex.: 42, 38": "placeholders.sizeShoes",
  "Ex.: Zara, local": "placeholders.brandFashion",
  "Ex.: Mala, cinto, relógio": "placeholders.productTypeFashionAccessory",
  "Ex.: Micro-ondas, fogão": "placeholders.productTypeKitchen",
  "Ex.: 350 L": "placeholders.capacityFridge",
  "Ex.: 8 kg": "placeholders.capacityLaundry",
  "Ex.: 12000 BTU": "placeholders.powerBtu",
  "Ex.: MAC, Maybelline": "placeholders.brandBeauty",
  "Ex.: Batom, base": "placeholders.productTypeMakeup",
  "Ex.: 250 ml": "placeholders.volumeCare",
  "Ex.: 100 ml": "placeholders.volumePerfume",
  "Ex.: Unhas, acessório": "placeholders.productTypeBeautyOther",
  "Ex.: Sofá, mesa de centro, estante": "placeholders.furnitureLivingRoom",
  "Ex.: Cama, roupeiro, criado-mudo": "placeholders.furnitureBedroom",
  "Ex.: Mesa, cadeiras, armário": "placeholders.furnitureKitchen",
  "Ex.: Secretária, cadeira, arquivo": "placeholders.furnitureOffice",
  "Ex.: Conjunto jardim, espreguiçadeira": "placeholders.furnitureOutdoor",
  "Ex.: Indique o móvel": "placeholders.furnitureDefault",
  "Ex.: 85000": "placeholders.mileageCar",
  "Ex.: 120000": "placeholders.mileageSuv",
  "Ex.: 1,5 t (opcional)": "placeholders.payload",
  "Ex.: Honda, Yamaha": "placeholders.brandMoto",
  "Ex.: PCX, FZ25": "placeholders.modelMoto",
  "Ex.: 125 cc": "placeholders.engine",
  "Ex.: Faróis, pneus, alternador": "placeholders.productTypeParts",
  "Ex.: Toyota Corolla 2018": "placeholders.compatible",
  "Ex.: Passadeira, halteres, banco": "placeholders.productTypeFitness",
  "Ex.: Bola, chuteiras": "placeholders.productTypeFootball",
  "Ex.: Bicicleta, capacete, luzes": "placeholders.productTypeCycling",
  "Ex.: Raquete, skate, equipamento ginásio": "placeholders.productTypeSportOther",
  "Ex.: Informática, canalização": "placeholders.serviceArea",
  "Ex.: Luanda": "placeholders.coverageLuanda",
  "Ex.: Doméstica, escritório": "placeholders.serviceTypeCleaning",
  "Ex.: Mudanças, entregas": "placeholders.serviceTypeTransport",
  "Ex.: Matemática, inglês, informática": "placeholders.subject",
  "Ex.: Eventos, fotografia, consultoria": "placeholders.serviceTypeOther",
  "Ex.: modelo ou referência": "placeholders.modelGeneric",
  "Ex.: Casaco, calças, vestido": "placeholders.productTypeClothing",
  "Ex.: Frigorífico, máquina de lavar": "placeholders.productTypeAppliance",
  "Ex.: Creme, perfume, maquilhagem": "placeholders.productTypeBeauty",
  "Ex.: Equipamento ou roupa desportiva": "placeholders.productTypeSport",
  "Ex.: Descreva o que oferece": "placeholders.serviceDescribe",
  "Ex.: Luanda, Talatona": "placeholders.coverageLuandaTalatona",
};

function resolveLabelKey(fieldKey: string, originalLabel: string): string {
  return LABEL_VARIANT_KEYS[originalLabel] ?? `${fieldKey}.label`;
}

function localizePlaceholder(
  t: CatalogFieldsTranslateFn,
  placeholder: string | undefined,
): string | undefined {
  if (!placeholder) return placeholder;
  const key = PLACEHOLDER_KEYS[placeholder] ?? `placeholders.${placeholder}`;
  return tf(t, key, placeholder);
}

function localizeFieldOption(
  fieldKey: string,
  option: { value: string; label: string },
  t: CatalogFieldsTranslateFn,
): { value: string; label: string } {
  return {
    value: option.value,
    label: tf(t, `${fieldKey}.options.${option.value}`, option.label),
  };
}

export function localizeProductFields(
  fields: ProductFieldDef[],
  t: CatalogFieldsTranslateFn,
): ProductFieldDef[] {
  return fields.map((field) => ({
    ...field,
    label: tf(t, resolveLabelKey(field.key, field.label), field.label),
    placeholder: localizePlaceholder(t, field.placeholder),
    options: field.options?.map((option) => localizeFieldOption(field.key, option, t)),
  }));
}

export function localizeConditionOptions(t: CatalogFieldsTranslateFn) {
  return CONDITION_OPTIONS.map((option) => ({
    value: option.value,
    label: tf(t, `condition.options.${option.value}`, option.label),
  }));
}

export function localizeCategoryKindLabel(
  category: { id: string; kind: string; name?: string },
  t: CatalogFieldsTranslateFn,
): string {
  if (category.id === "emprego" || category.kind === "job") {
    return tf(t, "categoryKind.job", getCategoryKindLabel(category));
  }
  if (
    category.id === "imoveis" ||
    category.kind === "stay" ||
    category.kind === "property"
  ) {
    return tf(t, "categoryKind.property", getCategoryKindLabel(category));
  }
  if (category.id === "servicos") {
    return tf(t, "categoryKind.services", getCategoryKindLabel(category));
  }
  return tf(t, "categoryKind.product", getCategoryKindLabel(category));
}

export function localizeSubcategoryFieldLabel(
  categoryId: string,
  t: CatalogFieldsTranslateFn,
): string {
  const fallback = getSubcategoryFieldLabel(categoryId);
  return tf(t, `subcategoryLabel.${categoryId}`, fallback);
}

export function localizeTitlePlaceholder(
  categoryId: string,
  subcategoryId: string | null | undefined,
  t: CatalogFieldsTranslateFn,
): string {
  const fallback = getTitlePlaceholder(categoryId, subcategoryId);
  if (subcategoryId && hasTitleBySub(categoryId, subcategoryId)) {
    const subKey = `titleBySub.${categoryId}_${subcategoryId}`;
    const translated = tf(t, subKey, fallback);
    if (translated !== fallback) return translated;
  }
  if (hasTitleByCategory(categoryId)) {
    return tf(t, `titleByCategory.${categoryId}`, fallback);
  }
  return tf(t, "titleByCategory.default", fallback);
}

export function localizeDescriptionPlaceholder(
  categoryId: string,
  subcategoryId: string | null | undefined,
  t: CatalogFieldsTranslateFn,
): string {
  const fallback = getDescriptionPlaceholder(categoryId, subcategoryId);
  if (subcategoryId && hasDescriptionBySub(categoryId, subcategoryId)) {
    const subKey = `descriptionBySub.${categoryId}_${subcategoryId}`;
    const translated = tf(t, subKey, fallback);
    if (translated !== fallback) return translated;
  }
  if (hasDescriptionByCategory(categoryId)) {
    return tf(t, `descriptionByCategory.${categoryId}`, fallback);
  }
  return tf(t, "descriptionByCategory.default", fallback);
}

export function localizePricePlaceholder(
  categoryId: string,
  subcategoryId: string | null | undefined,
  t: CatalogFieldsTranslateFn,
): string {
  const fallback = getPricePlaceholder(categoryId, subcategoryId);
  if (categoryId === "carros") return tf(t, "priceByCategory.carros", fallback);
  if (categoryId === "servicos") return tf(t, "priceByCategory.servicos", fallback);
  if (categoryId === "imoveis") return tf(t, "priceByCategory.imoveis", fallback);
  if (categoryId === "emprego") return tf(t, "priceByCategory.emprego", fallback);
  if (subcategoryId === "telefones") return tf(t, "priceBySub.telefones", fallback);
  if (subcategoryId === "tv-audio") return tf(t, "priceBySub.tv-audio", fallback);
  if (subcategoryId === "computadores") return tf(t, "priceBySub.computadores", fallback);
  if (categoryId === "eletronicos") return tf(t, "priceByCategory.eletronicos", fallback);
  return tf(t, "priceByCategory.default", fallback);
}

export function localizeProductMetaEntries(
  meta: Record<string, string | number | boolean | null> | null | undefined,
  t: CatalogFieldsTranslateFn,
): { label: string; value: string }[] {
  if (!meta) return [];
  return Object.entries(meta)
    .filter(([, v]) => v != null && String(v).trim() !== "")
    .map(([key, value]) => {
      const fallbackLabel = formatProductAttributeLabel(key);
      const fallbackValue = formatProductAttributeValue(key, value as string | number);
      const strValue = String(value);
      return {
        label: tf(t, resolveLabelKey(key, fallbackLabel), fallbackLabel),
        value: hasPredefinedProductAttributeOption(key, strValue)
          ? tf(t, `${key}.options.${strValue}`, fallbackValue)
          : fallbackValue,
      };
    });
}
