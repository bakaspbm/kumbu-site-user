import { Suspense } from "react";
import { ConfirmEmailClient } from "@/components/auth/confirm-email-client";
import { PageLoadingIndicator } from "@/components/ui/page-loading-indicator";

export default function ConfirmarEmailPage() {
  return (
    <main className="kumbu-container py-8">
      <h1 className="text-center text-2xl font-extrabold text-kumbu-ink">Confirmar email</h1>
      <Suspense fallback={<PageLoadingIndicator className="mt-8" />}>
        <ConfirmEmailClient />
      </Suspense>
    </main>
  );
}
