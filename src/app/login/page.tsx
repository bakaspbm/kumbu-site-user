import { Suspense } from "react";
import { OAuthConfigProvider } from "@/components/auth/oauth-config-provider";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <OAuthConfigProvider>
      <Suspense
        fallback={
          <p className="flex min-h-screen items-center justify-center text-sm text-kumbu-muted">
            A carregar…
          </p>
        }
      >
        <LoginForm />
      </Suspense>
    </OAuthConfigProvider>
  );
}
