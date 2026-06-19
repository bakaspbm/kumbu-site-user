"use client";

import { useTranslations } from "next-intl";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  rotatingLabels?: string[];
  className?: string;
  compact?: boolean;
};

export function PageLoadingIndicator({
  label,
  rotatingLabels,
  className,
  compact,
}: Props) {
  const tCommon = useTranslations("common");

  return (
    <div className={cn("px-4 py-8", className)}>
      <LoadingIndicator
        active
        label={label ?? tCommon("loading")}
        rotatingLabels={rotatingLabels}
        slowHint={tCommon("loadingSlowHint")}
        compact={compact}
      />
    </div>
  );
}
