import { NextResponse } from "next/server";
import { requireAdminCookie } from "@/lib/admin-api-auth";

type Ctx = { params: { id: string } };

export async function PATCH(_req: Request, context: Ctx) {
  if (!(await requireAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base = process.env.WHISPR_APP_URL?.trim()?.replace(/\/$/, "");
  const secret = process.env.INTERNAL_ADMIN_SHARED_SECRET?.trim();
  if (!base || !secret) {
    return NextResponse.json(
      {
        error:
          "Missing WHISPR_APP_URL or INTERNAL_ADMIN_SHARED_SECRET. Copy both from env.example.",
      },
      { status: 503 }
    );
  }

  const { id } = context.params;
  const res = await fetch(`${base}/api/internal/admin/users/${id}/approve`, {
    method: "PATCH",
    headers: { "x-whispr-internal-secret": secret },
  });
  const body = await res.json().catch(() => ({}));
  return NextResponse.json(body, { status: res.status });
}
