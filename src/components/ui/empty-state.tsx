import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "kumbu-card-elevated flex flex-col items-center px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-kumbu-primary-soft text-kumbu-primary ring-1 ring-kumbu-primary/10">
        <Icon className="size-7" strokeWidth={1.75} />
      </span>
      <h2 className="mt-4 text-lg font-bold text-kumbu-foreground">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-kumbu-muted">{description}</p>
      {actionLabel && actionHref && (
        <Button href={actionHref} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
