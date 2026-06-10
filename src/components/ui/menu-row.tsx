import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuRowProps {
  href: string;
  label: string;
  subtitle?: string;
  icon: LucideIcon;
  className?: string;
  badgeCount?: number;
}

export function MenuRow({
  href,
  label,
  subtitle,
  icon: Icon,
  className,
  badgeCount = 0,
}: MenuRowProps) {
  return (
    <Link
      href={href}
      className={cn(
        "kumbu-card-interactive group flex items-center gap-3 p-3.5",
        className,
      )}
    >
      <span className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-kumbu-primary-soft text-kumbu-primary transition-colors group-hover:bg-kumbu-primary group-hover:text-white">
        <Icon className="size-4" strokeWidth={1.75} />
        {badgeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-[1rem] items-center justify-center rounded-full bg-kumbu-primary px-1 text-[8px] font-bold text-white ring-2 ring-kumbu-surface">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[13px] font-semibold text-kumbu-foreground group-hover:text-kumbu-primary">
          {label}
        </span>
        {subtitle && (
          <span className="mt-0.5 block text-xs text-kumbu-muted">{subtitle}</span>
        )}
      </span>
      <ChevronRight className="size-5 shrink-0 text-kumbu-muted transition-transform group-hover:translate-x-0.5 group-hover:text-kumbu-primary" />
    </Link>
  );
}
