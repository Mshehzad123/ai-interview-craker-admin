import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminCookie } from "@/lib/admin-api-auth";

export async function GET() {
  if (!(await requireAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const count = await db.user.count({ where: { status: "pending" } });
  return NextResponse.json({ count });
}
