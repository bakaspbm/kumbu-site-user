import { AccountNav } from "@/components/account/account-nav";
import { ContaLayoutHeader } from "@/components/account/conta-layout-header";
import { ContaPageShell } from "@/components/account/conta-page-shell";
import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";

export default function ContaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="kumbu-container max-w-6xl pb-10 pt-4 md:pt-6">
      <ContaLayoutHeader />
      <AccountNav />
      <div className="mt-6">
        <EmailVerificationBanner />
        <ContaPageShell>{children}</ContaPageShell>
      </div>
    </div>
  );
}
