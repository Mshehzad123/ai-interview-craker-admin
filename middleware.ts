import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getSecret() {
  const s = process.env.ADMIN_JWT_SECRET?.trim();
  if (!s || s.length < 32) return null;
  return new TextEncoder().encode(s);
}

export async function middleware(request: NextRequest) {
  const secret = getSecret();
  if (!secret) {
    return NextResponse.redirect(new URL("/login?error=config", request.url));
  }

  const token = request.cookies.get("admin_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete("admin_token");
    return res;
  }
}

export const config = {
  matcher: ["/", "/customers", "/sessions", "/purchases", "/access-requests"],
};
