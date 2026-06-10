import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { KumbuLogo } from "@/components/brand/kumbu-logo";

export default function RecuperarPalavraPassePage() {
  return (
    <article className="kumbu-page-bg flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <KumbuLogo height={44} variant="badge" />
      </div>
      <div className="kumbu-card w-full max-w-md p-6 md:p-8">
        <KumbuLogo height={32} variant="wordmark" href={undefined} />
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Recuperar palavra-passe</h1>
        <div className="mt-6">
          <Suspense fallback={<p className="text-sm text-kumbu-muted">A carregar…</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </article>
  );
}
