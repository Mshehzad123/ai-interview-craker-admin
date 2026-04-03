import { SignJWT, jwtVerify } from "jose";

const COOKIE = "admin_token";

function getSecret() {
  const s = process.env.ADMIN_JWT_SECRET?.trim();
  if (!s || s.length < 32) {
    throw new Error("ADMIN_JWT_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(s);
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export { COOKIE };
