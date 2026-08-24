"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, X } from "lucide-react";

function detectInAppBrowser(ua: string): boolean {
  const u = ua.toLowerCase();
  return (
    u.includes("instagram") ||
    u.includes("fbav") ||
    u.includes("fban") ||
    u.includes("fb_iab") ||
    u.includes("line/") ||
    u.includes("tiktok") ||
    u.includes("musical_ly") ||
    (u.includes("wv") && (u.includes("android") || u.includes("iphone")))
  );
}

/**
 * Instagram / Facebook in-app browsers quebram cookies e OAuth.
 * Mostra um aviso para abrir no browser do sistema.
 */
export function InAppBrowserBanner() {
  const [visible, setVisible] = useState(false);
  const [href, setHref] = useState("https://www.kumbu-market.com");

  useEffect(() => {
    try {
      if (sessionStorage.getItem("kumbu_iab_dismissed") === "1") return;
    } catch {
      /* ignore */
    }
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    if (!detectInAppBrowser(ua)) return;
    setHref(window.location.href);
    setVisible(true);
  }, []);

  const openHref = useMemo(() => {
    try {
      const url = new URL(href);
      // Android Chrome intent — abre fora do WebView do Instagram.
      if (/android/i.test(navigator.userAgent)) {
        return `intent://${url.host}${url.pathname}${url.search}${url.hash}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url.toString())};end`;
      }
      return url.toString();
    } catch {
      return href;
    }
  }, [href]);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem("kumbu_iab_dismissed", "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="sticky top-0 z-[60] border-b border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
      <div className="mx-auto flex max-w-3xl items-start gap-2">
        <p className="flex-1 text-xs leading-snug sm:text-sm">
          Está a abrir o Kumbú dentro do Instagram/Facebook. Para o site funcionar bem
          (login e navegação), abra no browser.
        </p>
        <a
          href={openHref}
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-kumbu-primary px-2.5 py-1.5 text-xs font-semibold text-white"
          onClick={(e) => {
            // Em WebViews, `target="_blank"` frequentemente não abre um browser novo.
            // Para Android, força a abertura no Chrome via intent.
            if (/android/i.test(navigator.userAgent)) {
              e.preventDefault();
              window.location.href = openHref;
            }
          }}
        >
          Abrir <ExternalLink className="size-3.5" />
        </a>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md p-1 text-amber-800/70 hover:bg-amber-100"
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
