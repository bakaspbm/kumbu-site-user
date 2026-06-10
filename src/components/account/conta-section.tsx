import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContaSectionProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function ContaSection({
  icon: Icon,
  title,
  description,
  children,
  className,
  bodyClassName,
}: ContaSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl bg-kumbu-surface-muted/45 p-5 ring-1 ring-kumbu-border/60",
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        {Icon ? (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-kumbu-primary-soft text-kumbu-primary">
            <Icon className="size-4" strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className="text-sm font-bold tracking-tight text-kumbu-foreground">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-kumbu-muted">{description}</p>
          ) : null}
        </div>
      </div>
      <div className={cn("space-y-4", bodyClassName)}>{children}</div>
    </section>
  );
}

interface ContaPanelProps {
  children: ReactNode;
  className?: string;
}

export function ContaPanel({ children, className }: ContaPanelProps) {
  return (
    <div className={cn("kumbu-card space-y-5 p-5 sm:p-6", className)}>{children}</div>
  );
}
