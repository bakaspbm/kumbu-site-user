import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Mail, MessageCircle } from "lucide-react";
import { BackHeader } from "@/components/layout/back-header";
import { LegalLinksRow } from "@/components/legal/legal-links-row";
import { getSupportEmail } from "@/lib/config/support";

export default async function SupportPage() {
  const t = await getTranslations("support");
  const email = getSupportEmail();

  return (
    <>
      <BackHeader title={t("title")} href="/conta/perfil" />
      <main className="kumbu-container max-w-2xl space-y-6 py-8">
        <div className="kumbu-card p-6">
          <h2 className="text-lg font-bold">{t("subtitle")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-kumbu-muted">
            {t("contactDescription")}
          </p>

          <Link
            href="/support/chat"
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-kumbu-primary text-sm font-bold text-white shadow-md"
          >
            <MessageCircle className="size-5" />
            {t("supportMessages")}
          </Link>

          <ul className="mt-5 space-y-3">
            <li>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 rounded-xl border border-kumbu-border px-4 py-3 text-sm font-semibold hover:border-kumbu-primary"
              >
                <Mail className="size-5 text-kumbu-primary" aria-hidden />
                {email}
              </a>
            </li>
          </ul>
        </div>

        <section className="kumbu-card p-5">
          <h3 className="font-bold">{t("legalInfo")}</h3>
          <p className="mt-2 text-sm text-kumbu-muted">{t("legalInfoDesc")}</p>
          <div className="mt-4">
            <LegalLinksRow />
          </div>
        </section>

        <section className="kumbu-card p-5">
          <h3 className="font-bold">{t("reportContent")}</h3>
          <p className="mt-2 text-sm text-kumbu-muted">{t("reportContentDesc")}</p>
          <Link
            href="/como-funciona"
            className="mt-3 inline-block text-sm font-semibold text-kumbu-primary"
          >
            {t("howItWorksLink")}
          </Link>
        </section>
      </main>
    </>
  );
}
