export default function TrackOrderLoading() {
  return (
    <main className="mx-auto max-w-lg px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
      {/* Store pill */}
      <div className="skeleton-shimmer mx-auto h-10 w-40 rounded-full" />

      {/* Header */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="skeleton-shimmer h-3 w-24 rounded" />
        <div className="skeleton-shimmer h-6 w-56 rounded" />
        <div className="flex gap-2 pt-1">
          <div className="skeleton-shimmer h-5 w-20 rounded-full" />
          <div className="skeleton-shimmer h-5 w-16 rounded-full" />
        </div>
      </div>

      {/* Timeline card */}
      <div className="mt-8 rounded-2xl border border-zinc-100 bg-white p-5 sm:p-6">
        <div className="space-y-7">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="skeleton-shimmer h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="skeleton-shimmer h-4 w-28 rounded" />
                <div className="skeleton-shimmer h-3 w-44 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Items card */}
      <div className="mt-4 rounded-2xl border border-zinc-100 bg-white p-5">
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton-shimmer h-11 w-11 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="skeleton-shimmer h-4 w-3/5 rounded" />
                <div className="skeleton-shimmer h-3 w-16 rounded" />
              </div>
              <div className="skeleton-shimmer h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Address card */}
      <div className="mt-4 rounded-2xl border border-zinc-100 bg-white p-5">
        <div className="space-y-2">
          <div className="skeleton-shimmer h-3 w-24 rounded" />
          <div className="skeleton-shimmer h-4 w-40 rounded" />
          <div className="skeleton-shimmer h-3 w-56 rounded" />
        </div>
      </div>
    </main>
  );
}
