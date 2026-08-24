import { demoCategories } from "@/lib/store/demo-data";
import type { CatalogCategory } from "@/types/store";

/** Fallback offline — sem duplicar ids (demo já inclui emprego). */
export const publishFallbackCategories: CatalogCategory[] = demoCategories;
