export function PageSkeleton({ variant = "list" }: { variant?: "list" | "detail" }) {
  if (variant === "detail") {
    return (
      <div className="kumbu-fade-in animate-pulse p-4">
        <div className="h-10 rounded-xl bg-kumbu-surface-muted" />
        <div className="mx-auto mt-6 grid max-w-4xl gap-8 md:grid-cols-2">
          <div className="aspect-square rounded-3xl bg-kumbu-surface-muted" />
          <div className="space-y-4">
            <div className="h-10 w-1/3 rounded bg-kumbu-surface-muted" />
            <div className="h-8 w-2/3 rounded bg-kumbu-surface-muted" />
            <div className="h-20 rounded-2xl bg-kumbu-surface-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kumbu-fade-in animate-pulse space-y-4 p-4">
      <div className="h-10 rounded-xl bg-kumbu-surface-muted" />
      <div className="h-24 rounded-2xl bg-kumbu-surface-muted" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 rounded-2xl bg-kumbu-surface p-3">
            <div className="size-24 shrink-0 rounded-xl bg-kumbu-surface-muted" />
            <div className="flex flex-1 flex-col gap-2 py-1">
              <div className="h-4 w-3/4 rounded bg-kumbu-surface-muted" />
              <div className="h-4 w-1/3 rounded bg-kumbu-surface-muted" />
              <div className="h-3 w-1/2 rounded bg-kumbu-surface-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
