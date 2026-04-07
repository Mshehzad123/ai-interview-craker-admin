import { db } from "@/lib/db";
import { AccessRequestsPanel } from "@/components/admin/AccessRequestsPanel";

export const dynamic = "force-dynamic";

export default async function AccessRequestsPage() {
  const users = await db.user.findMany({
    orderBy: { requestedAt: "desc" },
    take: 500,
    select: {
      id: true,
      email: true,
      requestedAt: true,
      status: true,
    },
  });

  const rows = users.map((u) => ({
    id: u.id,
    email: u.email,
    requestedAt: u.requestedAt.toISOString(),
    status: u.status,
  }));

  return <AccessRequestsPanel rows={rows} />;
}
