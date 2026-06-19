import { Suspense } from "react";
import { OAuthConfigProvider } from "@/components/auth/oauth-config-provider";
import { PageLoadingIndicator } from "@/components/ui/page-loading-indicator";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <OAuthConfigProvider>
      <Suspense
        fallback={
          <PageLoadingIndicator className="flex min-h-screen items-center justify-center" />
        }
      >
        <LoginForm />
      </Suspense>
    </OAuthConfigProvider>
  );
}
