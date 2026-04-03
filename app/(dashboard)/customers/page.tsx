import { db } from "@/lib/db";
import { CustomersPanel } from "@/components/admin/CustomersPanel";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const users = await db.user.findMany({
    take: 200,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      credits: true,
      createdAt: true,
      _count: {
        select: {
          interviewSessions: true,
          documents: true,
          purchases: true,
        },
      },
    },
  });

  const rows = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    credits: u.credits,
    createdAt: u.createdAt.toISOString(),
    sessions: u._count.interviewSessions,
    documents: u._count.documents,
    purchases: u._count.purchases,
  }));

  return <CustomersPanel users={rows} />;
}
