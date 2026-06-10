import { Suspense } from "react";
import { ConfirmEmailClient } from "@/components/auth/confirm-email-client";

export default function ConfirmarEmailPage() {
  return (
    <main className="kumbu-container py-8">
      <h1 className="text-center text-2xl font-extrabold text-kumbu-ink">Confirmar email</h1>
      <Suspense fallback={<p className="mt-8 text-center text-sm text-kumbu-muted">A carregar…</p>}>
        <ConfirmEmailClient />
      </Suspense>
    </main>
  );
}
