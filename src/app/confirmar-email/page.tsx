import { ConfirmEmailClient } from "@/components/auth/confirm-email-client";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ConfirmarEmailPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = params.token?.trim() || "";

  return (
    <main className="kumbu-container py-8">
      <h1 className="text-center text-2xl font-extrabold text-kumbu-ink">Confirmar email</h1>
      <div className="mt-8">
        <ConfirmEmailClient initialToken={token} />
      </div>
    </main>
  );
}
