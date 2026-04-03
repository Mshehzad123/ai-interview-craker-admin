import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { AdminDataEmpty } from "@/components/admin/AdminDataEmpty";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  const sessions = await db.interviewSession.findMany({
    take: 150,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Sessions</h1>
        <p className="mt-1 text-sm text-muted">Recent interview sessions (last 150).</p>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle bg-surface shadow-[var(--shadow-md)]">
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[960px]">
            <thead>
              <tr>
                <th>Session ID</th>
                <th>User</th>
                <th>Language</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Credits</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <AdminDataEmpty
                      variant="sessions"
                      title="No sessions yet"
                      description="Interview sessions from the main app will appear here once users start sessions."
                    />
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id}>
                    <td className="max-w-[120px] truncate font-mono text-xs text-foreground">{s.id}</td>
                    <td className="max-w-[200px] truncate font-mono text-xs">{s.user.email}</td>
                    <td className="text-muted">{s.language}</td>
                    <td className="text-muted">{s.interviewType ?? "—"}</td>
                    <td className="tabular-nums text-muted">{s.duration}s</td>
                    <td className="tabular-nums text-muted">{s.creditsUsed}</td>
                    <td className="whitespace-nowrap text-muted">{formatDate(s.createdAt)}</td>
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
