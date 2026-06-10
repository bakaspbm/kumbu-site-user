import { Suspense } from "react";
import { CategoriesPage } from "@/components/store/categories-page";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <p className="kumbu-container py-16 text-center text-sm text-kumbu-muted">
          A carregar…
        </p>
      }
    >
      <CategoriesPage />
    </Suspense>
  );
}
