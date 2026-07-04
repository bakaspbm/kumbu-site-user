"use client";

import { SentryUserBridge } from "@/components/monitoring/sentry-user-bridge";
import { FetchGuard } from "@/components/providers/fetch-guard";
import { AuthUrlHandler } from "@/components/auth/auth-url-handler";
import { MultiAccountHint } from "@/components/auth/multi-account-hint";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { LiveSyncProvider } from "@/contexts/live-sync-context";
import { MessagesProvider } from "@/contexts/messages-context";
import { ModalRouteGuard } from "@/components/providers/modal-route-guard";
import { ThemeProvider } from "@/contexts/theme-context";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <FetchGuard />
      <ServiceWorkerRegister />
      <ModalRouteGuard />
      <AuthUrlHandler />
      <AuthProvider>
        <SentryUserBridge />
        <LiveSyncProvider>
          <MessagesProvider>
            <MultiAccountHint />
            <CartProvider>{children}</CartProvider>
          </MessagesProvider>
        </LiveSyncProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}