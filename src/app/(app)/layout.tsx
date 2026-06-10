import { BottomNav } from "@/components/layout/bottom-nav";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { RoutePrefetch } from "@/components/layout/route-prefetch";
import { OnboardingRedirect } from "@/components/home/onboarding-redirect";
import { OfflineBootstrapSync } from "@/components/pwa/offline-bootstrap-sync";
import { SiteFooter } from "@/components/layout/site-footer";
import { CookieConsentBanner } from "@/components/legal/cookie-consent-banner";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="kumbu-page-bg flex min-h-screen">
      <OfflineBootstrapSync />
      <RoutePrefetch />
      <OnboardingRedirect />
      <DesktopNav />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <div className="kumbu-page-enter flex-1 pb-[4.75rem] md:pb-0">{children}</div>
        <SiteFooter />
        <CookieConsentBanner />
        <BottomNav />
      </div>
    </div>
  );
}
