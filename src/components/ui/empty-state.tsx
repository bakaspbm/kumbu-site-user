import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  /** Passos numerados para orientar o utilizador (ex.: onboarding). */
  steps?: string[];
  /** Estado «zero inbox» — tom de conquista. */
  achievement?: boolean;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  steps,
  achievement = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "kumbu-card-elevated flex flex-col items-center px-6 py-14 text-center",
        achievement && "border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-2xl ring-1",
          achievement
            ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20"
            : "bg-kumbu-primary-soft text-kumbu-primary ring-kumbu-primary/10",
        )}
      >
        <Icon className="size-7" strokeWidth={1.75} />
      </span>
      <h2 className="mt-4 text-lg font-bold text-kumbu-foreground">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-kumbu-muted">{description}</p>
      {steps && steps.length > 0 ? (
        <ol className="mt-5 w-full max-w-sm space-y-2 text-left text-sm">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3 rounded-xl bg-kumbu-secondary/60 px-3 py-2.5">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-kumbu-primary text-xs font-bold text-white">
                {index + 1}
              </span>
              <span className="leading-snug text-kumbu-foreground">{step}</span>
            </li>
          ))}
        </ol>
      ) : null}
      {actionLabel && actionHref && (
        <Button href={actionHref} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
