"use client";

import Link from "next/link";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import type { PublishUserMessage } from "@/lib/publish/publish-user-message";

export function PublishErrorNotice({ notice }: { notice: PublishUserMessage }) {
  if (notice.kind === "restriction") {
    return (
      <div
        className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-4"
        role="alert"
      >
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-400" aria-hidden />
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-bold text-kumbu-foreground">{notice.title}</p>
            <p className="text-sm leading-relaxed text-kumbu-muted">{notice.body}</p>
            <Link
              href={notice.supportHref}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-kumbu-primary px-4 text-sm font-bold text-white transition hover:opacity-95"
            >
              {notice.supportLabel}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3.5"
      role="alert"
    >
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-400" aria-hidden />
      <p className="text-sm leading-relaxed text-kumbu-foreground">{notice.message}</p>
    </div>
  );
}
