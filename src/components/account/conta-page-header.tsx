import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContaPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function ContaPageHeader({
  title,
  description,
  icon: Icon,
  action,
  className,
}: ContaPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-kumbu-primary-soft text-kumbu-primary ring-1 ring-kumbu-primary/10">
            <Icon className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold tracking-tight text-kumbu-foreground md:text-xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-kumbu-muted">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
