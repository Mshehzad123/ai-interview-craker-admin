export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="skeleton h-8 w-40" />
        <div className="skeleton mt-3 h-4 w-full max-w-md" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-4 shadow-[var(--shadow-md)]"
          >
            <div className="skeleton mb-2 h-3 w-24" />
            <div className="skeleton h-9 w-20" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="skeleton h-[280px] rounded-[var(--radius-lg)] lg:col-span-2" />
        <div className="skeleton h-[280px] rounded-[var(--radius-lg)]" />
      </div>

      <div className="skeleton h-64 rounded-[var(--radius-lg)]" />

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-surface shadow-[var(--shadow-md)]">
        <div className="border-b border-border-subtle px-4 py-3">
          <div className="skeleton h-4 w-32" />
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
