import { AlertCircle } from "lucide-react";
import type { UserFacingError } from "@/lib/user-facing-error";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  error: UserFacingError | string;
  className?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function UserFacingErrorAlert({ error, className, onRetry, retryLabel }: Props) {
  const resolved: UserFacingError =
    typeof error === "string"
      ? { title: error, message: error }
      : error;

  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-900/50 dark:bg-red-950/40",
        className,
      )}
    >
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-semibold text-red-800 dark:text-red-200">{resolved.title}</p>
          {resolved.message !== resolved.title ? (
            <p className="leading-relaxed text-red-700 dark:text-red-300">{resolved.message}</p>
          ) : null}
          {resolved.action ? (
            <p className="text-xs leading-relaxed text-red-600/90 dark:text-red-400/90">
              {resolved.action}
            </p>
          ) : null}
          {resolved.fields && Object.keys(resolved.fields).length > 0 ? (
            <ul className="mt-2 list-inside list-disc text-xs text-red-700 dark:text-red-300">
              {Object.values(resolved.fields).map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          ) : null}
          {onRetry ? (
            <Button
              type="button"
              variant="secondary"
              className="mt-2 h-9 px-3 text-sm"
              onClick={onRetry}
            >
              {retryLabel ?? "Tentar novamente"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
