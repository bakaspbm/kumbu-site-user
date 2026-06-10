import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { KumbuLogo } from "@/components/brand/kumbu-logo";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto hidden border-t border-kumbu-border/80 bg-kumbu-surface md:block">
      <div className="kumbu-container flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <KumbuLogo height={30} href="/" />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-kumbu-muted">
            {t("tagline")}
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-kumbu-muted">
          <Link href="/categorias" className="transition-colors hover:text-kumbu-primary">
            {t("categories")}
          </Link>
          <Link href="/emprego" className="transition-colors hover:text-kumbu-primary">
            {t("jobs")}
          </Link>
          <Link href="/carrinho" className="transition-colors hover:text-kumbu-primary">
            {t("cart")}
          </Link>
          <Link href="/conta/compras" className="transition-colors hover:text-kumbu-primary">
            {t("orders")}
          </Link>
          <Link href="/support" className="transition-colors hover:text-kumbu-primary">
            {t("support")}
          </Link>
          <Link href="/como-funciona" className="transition-colors hover:text-kumbu-primary">
            {t("howItWorks")}
          </Link>
          <Link href="/termos" className="transition-colors hover:text-kumbu-primary">
            {t("terms")}
          </Link>
          <Link href="/privacidade" className="transition-colors hover:text-kumbu-primary">
            {t("privacy")}
          </Link>
          <Link href="/login" className="transition-colors hover:text-kumbu-primary">
            {t("account")}
          </Link>
        </nav>
      </div>
      <div className="border-t border-kumbu-border/60 py-5 text-center text-xs font-medium text-kumbu-muted">
        <p>{t("copyright", { year })}</p>
        <p className="mt-2">
          <Link href="/regras-publicacao" className="hover:text-kumbu-primary">
            {t("publishingRules")}
          </Link>
          {" · "}
          <Link href="/cookies" className="hover:text-kumbu-primary">
            {t("cookies")}
          </Link>
        </p>
      </div>
    </footer>
  );
}
