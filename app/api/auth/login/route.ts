import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SignJWT } from "jose";
import { COOKIE } from "@/lib/admin-jwt";
import { verifyAdminPassword } from "@/lib/admin-auth";

const bodySchema = z.object({ password: z.string().min(1).max(512) });

// Per-IP rate limit: 5 attempts / 5 minutes. Resets on success.
const ATTEMPTS = new Map<string, { count: number; firstAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000;

function clientIp(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function getSecret() {
  const s = process.env.ADMIN_JWT_SECRET?.trim();
  if (!s || s.length < 32) return null;
  return new TextEncoder().encode(s);
}

export async function POST(req: NextRequest) {
  const secret = getSecret();
  const storedCredential = process.env.ADMIN_PASSWORD_HASH?.trim();

  if (!storedCredential || !secret) {
    return NextResponse.json(
      {
        error:
          "Admin is not configured. Set ADMIN_PASSWORD_HASH (scrypt — see scripts/hash-password.mjs) " +
          "and ADMIN_JWT_SECRET (>= 32 chars) in .env.",
      },
      { status: 503 }
    );
  }

  if (!storedCredential.includes(":")) {
    return NextResponse.json(
      {
        error:
          "ADMIN_PASSWORD_HASH is malformed. Plain-text passwords are no longer accepted. " +
          "Run `node scripts/hash-password.mjs \"<password>\"` and use the output.",
      },
      { status: 503 }
    );
  }

  const ip = clientIp(req);
  const now = Date.now();
  const entry = ATTEMPTS.get(ip);
  if (entry && now - entry.firstAt < WINDOW_MS && entry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - entry.firstAt)) / 1000);
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const valid = await verifyAdminPassword(parsed.data.password, storedCredential);
  if (!valid) {
    if (!entry || now - entry.firstAt >= WINDOW_MS) {
      ATTEMPTS.set(ip, { count: 1, firstAt: now });
    } else {
      entry.count += 1;
    }
    // Constant-ish error so brute-force can't distinguish "wrong password" from "no user".
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  ATTEMPTS.delete(ip);

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
