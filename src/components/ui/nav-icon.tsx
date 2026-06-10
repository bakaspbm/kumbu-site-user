"use client";

import { useEffect, useState, type ComponentType } from "react";
import type { LucideProps } from "lucide-react";

type LucideIcon = ComponentType<LucideProps>;

export function NavIcon({
  icon: Icon,
  className,
  strokeWidth,
}: {
  icon: LucideIcon;
  className?: string;
  strokeWidth?: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className} aria-hidden />;
  }

  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
