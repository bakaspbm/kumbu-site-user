import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { routing, type AppLocale } from "./routing";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = routing.locales.includes(raw as AppLocale)
    ? (raw as AppLocale)
    : routing.defaultLocale;

  const [main, legal] = await Promise.all([
    import(`../messages/${locale}.json`),
    import(`../messages/legal/${locale}.json`),
  ]);

  return {
    locale,
    messages: { ...main.default, legalContent: legal.default },
  };
});
