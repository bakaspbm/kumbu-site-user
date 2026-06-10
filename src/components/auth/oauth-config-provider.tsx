"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import {
  fetchOAuthPublicConfig,
  type OAuthPublicConfig,
} from "@/lib/kumbu-api/oauth-config";

type OAuthConfigContextValue = {
  config: OAuthPublicConfig | null;
  loading: boolean;
};

const OAuthConfigContext = createContext<OAuthConfigContextValue>({
  config: null,
  loading: true,
});

export function useOAuthConfig(): OAuthConfigContextValue {
  return useContext(OAuthConfigContext);
}

export function OAuthConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<OAuthPublicConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchOAuthPublicConfig()
      .then((value) => {
        if (!cancelled) setConfig(value);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ config, loading }), [config, loading]);

  const googleClientId = config?.googleClientId ?? null;
  const inner =
    googleClientId != null ? (
      <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>
    ) : (
      children
    );

  return (
    <OAuthConfigContext.Provider value={value}>{inner}</OAuthConfigContext.Provider>
  );
}
