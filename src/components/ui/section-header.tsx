import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = "Ver tudo",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div>
        <h2 className="kumbu-section-title">{title}</h2>
        {subtitle && <p className="kumbu-section-subtitle">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="kumbu-link-pill shrink-0">
          {linkLabel}
          <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
