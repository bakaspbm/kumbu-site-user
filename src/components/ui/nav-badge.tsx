import { cn } from "@/lib/utils";

interface NavBadgeProps {
  count: number;
  className?: string;
  pulse?: boolean;
}

export function NavBadge({ count, className, pulse = false }: NavBadgeProps) {
  if (count <= 0) return null;

  const label = count > 9 ? "9+" : String(count);

  return (
    <span
      className={cn(
        "absolute flex min-w-[1.125rem] items-center justify-center rounded-full bg-kumbu-primary px-1 text-[9px] font-bold leading-none text-white ring-2 ring-kumbu-surface",
        count > 9 ? "h-[1.125rem] px-1" : "size-[1.125rem]",
        pulse && "animate-pulse",
        className,
      )}
      aria-label={`${count} não lidas`}
    >
      {label}
    </span>
  );
}
