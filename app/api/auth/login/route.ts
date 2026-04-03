import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SignJWT } from "jose";
import { COOKIE } from "@/lib/admin-jwt";

const bodySchema = z.object({ password: z.string().min(1) });

function getSecret() {
  const s = process.env.ADMIN_JWT_SECRET?.trim();
  if (!s || s.length < 32) return null;
  return new TextEncoder().encode(s);
}

export async function POST(req: NextRequest) {
  const adminPass = process.env.ADMIN_PASSWORD?.trim();
  const secret = getSecret();

  if (!adminPass || !secret) {
    return NextResponse.json(
      { error: "Admin is not configured (ADMIN_PASSWORD / ADMIN_JWT_SECRET)." },
      { status: 503 }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { timingSafeEqual, createHash } = await import("crypto");
  const a = createHash("sha256").update(parsed.data.password).digest();
  const b = createHash("sha256").update(adminPass).digest();
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
