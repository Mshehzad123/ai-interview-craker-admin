export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-56 rounded-md" />
      <div className="skeleton h-4 w-96 max-w-full rounded-md" />
      <div className="skeleton mt-6 h-64 w-full rounded-[var(--radius-lg)]" />
    </div>
  );
}
