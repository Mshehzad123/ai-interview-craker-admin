import { NextResponse } from "next/server";
import { requireAdminCookie } from "@/lib/admin-api-auth";

type Ctx = { params: { id: string } };

export async function PATCH(_req: Request, context: Ctx) {
  if (!(await requireAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base = process.env.WHISPR_APP_URL?.trim()?.replace(/\/$/, "");
  const secret = process.env.WHISPR_ADMIN_SERVICE_SECRET?.trim();
  if (!base || !secret) {
    return NextResponse.json(
      {
        error:
          "Missing WHISPR_APP_URL or WHISPR_ADMIN_SERVICE_SECRET. Copy both from env.example — the secret must match WHISPR_ADMIN_SERVICE_SECRET in the Whispr app .env.",
      },
      { status: 503 }
    );
  }

  const { id } = context.params;
  const res = await fetch(`${base}/api/admin/users/${id}/approve`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await res.json().catch(() => ({}));
  return NextResponse.json(body, { status: res.status });
}
