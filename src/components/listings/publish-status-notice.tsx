"use client";

import { LoadingIndicator } from "@/components/ui/loading-indicator";

export function PublishLoadingNotice({
  message,
  hint,
  rotatingHints,
  slowHint,
  active = true,
}: {
  message: string;
  hint?: string;
  rotatingHints?: string[];
  slowHint?: string;
  active?: boolean;
}) {
  const rotation = [
    ...(hint ? [hint] : []),
    ...(rotatingHints ?? []),
    message,
  ].filter(Boolean);

  return (
    <LoadingIndicator
      active={active}
      label={message}
      rotatingLabels={rotation.length > 1 ? rotation : [message]}
      slowHint={slowHint}
    />
  );
}

export { PublishErrorNotice } from "@/components/listings/publish-error-notice";
