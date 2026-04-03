import { db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/utils";
import { AdminDataEmpty } from "@/components/admin/AdminDataEmpty";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "completed" || s === "success")
    return "border border-[var(--success)] bg-[var(--success-dim)] text-[var(--success)]";
  if (s === "refunded")
    return "border border-[var(--amber)] bg-[var(--amber-dim)] text-[var(--amber)]";
  if (s === "failed")
    return "border border-[var(--error)] bg-[var(--error-dim)] text-[var(--error)]";
  return "border border-border-subtle bg-elevated text-muted";
}

export default async function PurchasesPage() {
  const purchases = await db.purchase.findMany({
    take: 200,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true } },
    },
  });

  const totals = purchases.reduce(
    (acc, p) => {
      if (p.status === "completed") acc.revenue += p.amount;
      if (p.status === "refunded") acc.refunds += p.amount;
      return acc;
    },
    { revenue: 0, refunds: 0 }
  );
  const net = totals.revenue - totals.refunds;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Revenue</h1>
        <p className="mt-1 text-sm text-muted">Recent billing events (last 200).</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-tertiary">Total revenue</p>
          <p className="mt-1 font-mono text-2xl text-[var(--accent)]">{formatMoney(totals.revenue)}</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-tertiary">Refunds</p>
          <p className="mt-1 font-mono text-2xl text-[var(--amber)]">{formatMoney(totals.refunds)}</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-tertiary">Net</p>
          <p className="mt-1 font-mono text-2xl text-foreground">{formatMoney(net)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-surface shadow-[var(--shadow-md)]">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[880px]">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>User</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Credits</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <AdminDataEmpty
                      variant="revenue"
                      title="No transactions yet"
                      description="Completed purchases and refunds from Stripe will show up in this table."
                    />
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id}>
                    <td className="max-w-[140px] truncate font-mono text-xs">{p.id}</td>
                    <td className="max-w-[220px] truncate font-mono text-xs">{p.user.email}</td>
                    <td className="text-muted">{p.plan}</td>
                    <td className="tabular-nums text-foreground">{formatMoney(p.amount, p.currency ?? "USD")}</td>
                    <td className="tabular-nums text-muted">{p.credits}</td>
                    <td className="whitespace-nowrap text-muted">{formatDate(p.createdAt)}</td>
                    <td>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${statusBadge(p.status)}`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
