"use client";

import { sanitizeAppLink } from "@/lib/urls/safe-link";

type Props = {
  link: string;
  label?: string;
};

/** Mostra link directo quando SMTP não está activo (apenas desenvolvimento). */
export function DevEmailActionLink({ link, label = "Confirmar email agora" }: Props) {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const safeLink = sanitizeAppLink(link);
  if (!safeLink) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950">
      <p className="font-semibold">Modo desenvolvimento — SMTP inactivo</p>
      <p className="mt-1 text-amber-900/90">
        Nenhum email real foi enviado. Use o link abaixo para continuar:
      </p>
      <a
        href={safeLink}
        className="mt-2 inline-block break-all font-semibold text-kumbu-primary underline"
      >
        {label}
      </a>
    </div>
  );
}
