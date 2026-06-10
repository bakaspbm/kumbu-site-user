"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AccountQuickLinks } from "@/components/account/account-quick-links";

function shouldShowSidebar(pathname: string): boolean {
  if (pathname === "/conta/perfil" || pathname.startsWith("/conta/perfil/")) {
    return false;
  }
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "conta" && segments.length >= 3) {
    return false;
  }
  return true;
}

export function ContaPageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const showSidebar = shouldShowSidebar(pathname);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start">
      <div className="min-w-0">{children}</div>
      <aside className="hidden space-y-5 lg:sticky lg:top-24 lg:block">
        <AccountQuickLinks variant="sidebar" />
      </aside>
      <div className="lg:hidden">
        <AccountQuickLinks />
      </div>
    </div>
  );
}
