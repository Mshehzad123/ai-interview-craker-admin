import { db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/utils";
import { AdminDataEmpty } from "@/components/admin/AdminDataEmpty";
import { Users, CalendarClock, CreditCard, Activity } from "lucide-react";
import {
  SignupsChart,
  CreditsBarChart,
  RevenuePieChart,
} from "@/components/admin/OverviewCharts";

export const dynamic = "force-dynamic";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function last30DaysKeys() {
  const keys: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    keys.push(dayKey(d));
  }
  return keys;
}

export default async function OverviewPage() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thirtyAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    userCount,
    sessionCount,
    sessionsToday,
    purchaseAgg,
    recentUsers,
    signupsInRange,
    purchasesInRange,
    planAgg,
  ] = await Promise.all([
    db.user.count(),
    db.interviewSession.count(),
    db.interviewSession.count({ where: { createdAt: { gte: startOfDay } } }),
    db.purchase.aggregate({
      where: { status: "completed" },
      _sum: { amount: true },
    }),
    db.user.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, credits: true, createdAt: true },
    }),
    db.user.findMany({
      where: { createdAt: { gte: thirtyAgo } },
      select: { createdAt: true },
    }),
    db.purchase.findMany({
      where: { status: "completed", createdAt: { gte: thirtyAgo } },
      select: { credits: true, amount: true, createdAt: true, plan: true },
    }),
    db.purchase.groupBy({
      by: ["plan"],
      where: { status: "completed" },
      _sum: { amount: true },
    }),
  ]);

  const revenue = purchaseAgg._sum.amount ?? 0;

  const dayKeys = last30DaysKeys();
  const signupCounts: Record<string, number> = {};
  for (const k of dayKeys) signupCounts[k] = 0;
  for (const u of signupsInRange) {
    const k = dayKey(new Date(u.createdAt));
    if (signupCounts[k] !== undefined) signupCounts[k] += 1;
  }
  const signupsChart = dayKeys.map((k) => ({
    day: k.slice(5),
    signups: signupCounts[k] ?? 0,
  }));

  const creditCounts: Record<string, number> = {};
  for (const k of dayKeys) creditCounts[k] = 0;
  for (const p of purchasesInRange) {
    const k = dayKey(new Date(p.createdAt));
    if (creditCounts[k] !== undefined) creditCounts[k] += p.credits;
  }
  const creditsChart = dayKeys.map((k) => ({
    day: k.slice(5),
    credits: Math.round((creditCounts[k] ?? 0) * 10) / 10,
  }));

  const pieData = planAgg
    .map((p) => ({
      name: p.plan || "Unknown",
      value: p._sum.amount ?? 0,
    }))
    .filter((x) => x.value > 0);

  const kpis = [
    {
      label: "Total Users",
      value: userCount.toLocaleString(),
      icon: Users,
      tone: "accent" as const,
    },
    {
      label: "Sessions Today",
      value: sessionsToday.toLocaleString(),
      icon: CalendarClock,
      tone: "live" as const,
    },
    {
      label: "Revenue (completed)",
      value: formatMoney(revenue),
      icon: CreditCard,
      tone: "amber" as const,
    },
    {
      label: "All Sessions",
      value: sessionCount.toLocaleString(),
      icon: Activity,
      tone: "white" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Overview</h1>
        <p className="mt-1 text-sm text-muted">
          Live metrics from ParakeetAI production database (read-only views).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((c) => (
          <div
            key={c.label}
            className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-4 shadow-[var(--shadow-md)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-tertiary">
                  {c.label}
                </p>
                <p
                  className={`kpi-num mt-1 ${
                    c.tone === "amber"
                      ? "!text-[var(--amber)]"
                      : c.tone === "white"
                        ? "!text-[var(--text-primary)]"
                        : ""
                  }`}
                >
                  {c.tone === "live" ? (
                    <span className="inline-flex items-center gap-2 text-[var(--accent)]">
                      <span className="listening-dot" />
                      {c.value}
                    </span>
                  ) : (
                    c.value
                  )}
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-border-subtle bg-elevated p-2">
                <c.icon className="h-5 w-5 text-accent" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SignupsChart data={signupsChart} />
        </div>
        <div>
          <RevenuePieChart data={pieData} />
        </div>
      </div>

      <CreditsBarChart data={creditsChart} />

      <div className="rounded-[var(--radius-lg)] border border-border-subtle bg-surface shadow-[var(--shadow-md)]">
        <div className="border-b border-border-subtle px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[520px]">
            <thead>
              <tr>
                <th>Email</th>
                <th>Credits</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-0">
                    <AdminDataEmpty
                      variant="users"
                      title="No recent signups"
                      description="New users will appear in this list as they register."
                    />
                  </td>
                </tr>
              ) : (
                recentUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="font-mono text-xs text-foreground">{u.email}</td>
                    <td className="tabular-nums text-muted">{u.credits}</td>
                    <td className="text-muted">{formatDate(u.createdAt)}</td>
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
