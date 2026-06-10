import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
  href?: string;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "kumbu-gradient-brand text-white shadow-[var(--shadow-kumbu-xs)] hover:shadow-[var(--shadow-kumbu-sm)] hover:brightness-[1.02] disabled:opacity-50",
  secondary:
    "border border-kumbu-border bg-kumbu-surface text-kumbu-foreground hover:border-kumbu-primary/15 hover:bg-kumbu-primary-soft/60",
  ghost: "bg-transparent text-kumbu-foreground hover:bg-kumbu-foreground/5",
  outline:
    "border border-kumbu-primary/25 text-kumbu-primary bg-transparent hover:bg-kumbu-primary-soft",
};

const base =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-200 active:scale-[0.99]";

export function Button({
  className,
  variant = "primary",
  fullWidth,
  href,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], fullWidth && "w-full", className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
