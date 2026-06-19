import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { KumbuLogo } from "@/components/brand/kumbu-logo";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto hidden border-t border-kumbu-border/80 bg-kumbu-surface md:block">
      <div className="kumbu-container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <KumbuLogo height={30} href="/" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-kumbu-muted">
            {t("tagline")}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-kumbu-foreground">
            {t("exploreSection")}
          </p>
          <nav className="mt-3 flex flex-col gap-2.5 text-sm font-medium text-kumbu-muted">
            <Link href="/categorias" className="transition-colors hover:text-kumbu-primary">
              {t("categories")}
            </Link>
            <Link href="/emprego" className="transition-colors hover:text-kumbu-primary">
              {t("jobs")}
            </Link>
            <Link href="/como-funciona" className="transition-colors hover:text-kumbu-primary">
              {t("howItWorks")}
            </Link>
          </nav>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-kumbu-foreground">
            {t("accountSection")}
          </p>
          <nav className="mt-3 flex flex-col gap-2.5 text-sm font-medium text-kumbu-muted">
            <Link href="/conta/compras" className="transition-colors hover:text-kumbu-primary">
              {t("orders")}
            </Link>
            <Link href="/carrinho" className="transition-colors hover:text-kumbu-primary">
              {t("cart")}
            </Link>
            <Link href="/conta/perfil" className="transition-colors hover:text-kumbu-primary">
              {t("account")}
            </Link>
          </nav>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-kumbu-foreground">
            {t("supportSection")}
          </p>
          <nav className="mt-3 flex flex-col gap-2.5 text-sm font-medium text-kumbu-muted">
            <Link href="/support" className="transition-colors hover:text-kumbu-primary">
              {t("support")}
            </Link>
            <Link href="/termos" className="transition-colors hover:text-kumbu-primary">
              {t("terms")}
            </Link>
            <Link href="/privacidade" className="transition-colors hover:text-kumbu-primary">
              {t("privacy")}
            </Link>
            <Link href="/regras-publicacao" className="transition-colors hover:text-kumbu-primary">
              {t("publishingRules")}
            </Link>
            <Link href="/cookies" className="transition-colors hover:text-kumbu-primary">
              {t("cookies")}
            </Link>
          </nav>
        </div>
      </div>

      <div className="border-t border-kumbu-border/60 py-5 text-center text-xs font-medium text-kumbu-muted">
        <p>{t("copyright", { year })}</p>
      </div>
    </footer>
  );
}
