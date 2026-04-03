export default function PurchasesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="skeleton h-8 w-32" />
        <div className="skeleton mt-2 h-4 w-64 max-w-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-4"
          >
            <div className="skeleton mb-2 h-3 w-24" />
            <div className="skeleton h-8 w-28" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-surface shadow-[var(--shadow-md)]">
        <div className="space-y-0 p-2">
          <div className="skeleton mb-2 h-10 w-full" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton mb-2 h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
