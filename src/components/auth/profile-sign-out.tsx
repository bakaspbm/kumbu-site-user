"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutBackend } from "@/lib/kumbu-api/auth";

export function ProfileSignOut() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        logoutBackend();
        router.push("/conta/perfil");
        router.refresh();
      }}
      className="kumbu-card flex w-full items-center justify-center gap-2 p-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
    >
      <LogOut className="size-4" />
      Terminar sessão
    </button>
  );
}
