import { EMPREGO_CATEGORY_ID } from "@/lib/jobs/constants";
import { demoCategories } from "@/lib/store/demo-data";
import type { CatalogCategory } from "@/types/store";

export const publishFallbackCategories: CatalogCategory[] = [
  ...demoCategories,
  {
    id: EMPREGO_CATEGORY_ID,
    name: "Emprego",
    kind: "job",
    sortOrder: 9,
  },
];
