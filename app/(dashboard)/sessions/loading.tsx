export default function SessionsLoading() {
  return (
    <div className="space-y-4">
      <div>
        <div className="skeleton h-8 w-36" />
        <div className="skeleton mt-2 h-4 w-72 max-w-full" />
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
