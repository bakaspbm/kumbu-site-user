import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";
import { AppProviders } from "@/components/providers/app-providers";
import { IntlProvider } from "@/components/providers/intl-provider";
import { ThemeScript } from "@/components/providers/theme-script";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: {
      default: t("title"),
      template: `%s | Kumbú`,
    },
    description: t("description"),
    icons: { icon: "/logo_kumbu.png", apple: "/logo_kumbu.png" },
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Kumbú",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#D62828" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={plusJakarta.variable} suppressHydrationWarning>
      <head suppressHydrationWarning>
        <ThemeScript />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>
        <IntlProvider>
          <AppProviders>{children}</AppProviders>
        </IntlProvider>
      </body>
    </html>
  );
}
