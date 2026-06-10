import Link from "next/link";
import { cn } from "@/lib/utils";

export type KumbuLogoVariant = "badge" | "wordmark" | "onDark" | "image";

interface KumbuLogoProps {
  height?: number;
  className?: string;
  href?: string;
  variant?: KumbuLogoVariant;
}

function LogoWordmark({
  size,
  onDark,
  className,
}: {
  size: number;
  onDark?: boolean;
  className?: string;
}) {
  const fontSize = Math.round(size * 0.58);
  const dotSize = Math.max(5, Math.round(size * 0.14));

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-px font-extrabold leading-none tracking-tight",
        className,
      )}
      style={{ fontSize }}
      aria-hidden
    >
      <span
        className={cn(
          "bg-clip-text text-transparent",
          onDark
            ? "bg-gradient-to-br from-white to-white/85"
            : "bg-gradient-to-br from-kumbu-primary to-[#e85a4f]",
        )}
      >
        K
      </span>
      <span className={onDark ? "text-white/95" : "text-kumbu-foreground"}>umbú</span>
      <span
        className={cn(
          "mb-[0.12em] shrink-0 rounded-full",
          onDark ? "bg-white/90 shadow-sm" : "bg-kumbu-primary shadow-[0_0_8px_rgba(214,40,40,0.35)]",
        )}
        style={{ width: dotSize, height: dotSize }}
      />
    </span>
  );
}

function LogoBadge({
  size,
  onDark,
  className,
}: {
  size: number;
  onDark?: boolean;
  className?: string;
}) {
  const padX = Math.round(size * 0.38);
  const padY = Math.round(size * 0.22);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-2xl border transition-shadow",
        onDark
          ? "border-white/25 bg-white/12 shadow-[0_4px_24px_rgba(0,0,0,0.12)] backdrop-blur-md ring-1 ring-white/20"
          : [
              "border-kumbu-border/90 bg-gradient-to-br from-white via-white to-kumbu-primary-soft/40",
              "shadow-[var(--shadow-kumbu-sm)] ring-1 ring-white/90",
              "hover:shadow-[var(--shadow-kumbu-md)] hover:border-kumbu-primary/15",
            ],
        className,
      )}
      style={{ paddingLeft: padX, paddingRight: padX, paddingTop: padY, paddingBottom: padY }}
    >
      <LogoWordmark size={size} onDark={onDark} />
    </span>
  );
}

export function KumbuLogo({
  height = 32,
  className,
  href = "/",
  variant = "badge",
}: KumbuLogoProps) {
  const content =
    variant === "image" ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/logo_kumbu.png"
        alt="Kumbú"
        width={Math.round(height * 3.2)}
        height={height}
        decoding="async"
        className={cn("h-auto w-auto rounded-xl object-contain", className)}
        style={{ height: `${height}px` }}
        suppressHydrationWarning
      />
    ) : variant === "wordmark" ? (
      <LogoWordmark size={height} className={className} />
    ) : variant === "onDark" ? (
      <LogoBadge size={height} onDark className={className} />
    ) : (
      <LogoBadge size={height} className={className} />
    );

  const label = (
    <span className={cn("inline-flex shrink-0 items-center", className)}>{content}</span>
  );

  if (!href) {
    return (
      <span className="inline-flex shrink-0" aria-label="Kumbú">
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex shrink-0 rounded-2xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-kumbu-primary/30"
      aria-label="Kumbú — início"
    >
      {label}
    </Link>
  );
}
