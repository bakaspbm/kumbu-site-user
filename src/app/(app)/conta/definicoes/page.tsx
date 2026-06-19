import { ContaPageHeader } from "@/components/account/conta-page-header";
import { ContaPanel, ContaSection } from "@/components/account/conta-section";
import { RequireAuth } from "@/components/auth/require-auth";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { LanguageSelector } from "@/components/settings/language-selector";
import { AccountExport } from "@/components/settings/account-export";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { IdentityUpload } from "@/components/settings/identity-upload";
import { LegalLinksRow } from "@/components/legal/legal-links-row";
import { ProfileSignOut } from "@/components/auth/profile-sign-out";
import Link from "next/link";
import { ChevronRight, KeyRound, Settings, Shield, User } from "lucide-react";
import { getTranslations } from "next-intl/server";

function SettingsLinkRow({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-xl px-3 py-3.5 text-sm font-semibold text-kumbu-foreground transition-colors hover:bg-kumbu-primary-soft/50 hover:text-kumbu-primary"
    >
      {label}
      <ChevronRight className="size-4 text-kumbu-muted transition-transform group-hover:translate-x-0.5 group-hover:text-kumbu-primary" />
    </Link>
  );
}

export default async function ContaDefinicoesPage() {
  const t = await getTranslations("settings");

  return (
    <RequireAuth>
      <div className="space-y-5">
        <ContaPanel className="!p-0 overflow-hidden">
          <div className="p-5 sm:p-6">
            <ContaPageHeader
              icon={Settings}
              title={t("title")}
              description={t("description")}
            />
          </div>
        </ContaPanel>

        <ContaPanel>
          <ContaSection icon={Settings} title={t("language")} description={t("languageDesc")}>
            <LanguageSelector />
          </ContaSection>
        </ContaPanel>

        <ContaPanel>
          <ContaSection icon={Settings} title={t("appearance")} description={t("appearanceDesc")}>
            <ThemeSelector />
          </ContaSection>
        </ContaPanel>

        <ContaPanel>
          <ContaSection icon={KeyRound} title={t("password")} description={t("passwordDesc")}>
            <ChangePasswordForm />
          </ContaSection>
        </ContaPanel>

        <ContaPanel>
          <ContaSection icon={User} title={t("yourData")} description={t("yourDataDesc")}>
            <AccountExport />
          </ContaSection>
        </ContaPanel>

        <ContaPanel>
          <ContaSection
            icon={Shield}
            title={t("identity")}
            description={t("identityDesc")}
          >
            <IdentityUpload />
          </ContaSection>
        </ContaPanel>

        <ContaPanel>
          <ContaSection title={t("legalPrivacy")}>
            <LegalLinksRow className="flex flex-col gap-1 text-sm font-semibold" />
          </ContaSection>
        </ContaPanel>

        <ContaPanel>
          <ContaSection title={t("accountSection")}>
            <div className="divide-y divide-kumbu-border/70 rounded-xl ring-1 ring-kumbu-border/60">
              <SettingsLinkRow href="/conta/perfil" label={t("addressProfile")} />
              <SettingsLinkRow href="/support" label={t("support")} />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-kumbu-muted">
              {t("accountChangesNote")}{" "}
              <Link href="/support" className="font-semibold text-kumbu-primary hover:underline">
                {t("contactSupport")}
              </Link>
            </p>
            <div className="mt-5 border-t border-kumbu-border/70 pt-5">
              <ProfileSignOut />
            </div>
          </ContaSection>
        </ContaPanel>
      </div>
    </RequireAuth>
  );
}
