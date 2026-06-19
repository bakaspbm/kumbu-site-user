"use client";

import { useEffect, useState } from "react";
import { isKumbuApiEnabled } from "@/lib/kumbu-api/client";
import { getMonetizationCatalogBackend } from "@/lib/kumbu-api/monetization";
import { isUserMonetizationVisible } from "@/lib/monetization/user-facing";

/** null = a carregar; false/true = estado conhecido */
export function useUserMonetizationVisible(): boolean | null {
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isKumbuApiEnabled()) {
      setVisible(false);
      return;
    }
    void getMonetizationCatalogBackend()
      .then((catalog) => setVisible(isUserMonetizationVisible(catalog.chargingEnabled)))
      .catch(() => setVisible(false));
  }, []);

  return visible;
}
