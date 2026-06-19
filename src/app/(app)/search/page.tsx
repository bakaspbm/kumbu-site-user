import { Suspense } from "react";
import { CategoriesPage } from "@/components/store/categories-page";
import { PageLoadingIndicator } from "@/components/ui/page-loading-indicator";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <PageLoadingIndicator className="kumbu-container flex min-h-[50vh] items-center justify-center py-16" />
      }
    >
      <CategoriesPage />
    </Suspense>
  );
}
