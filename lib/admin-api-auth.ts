import { cookies } from "next/headers";
import { COOKIE, verifyAdminToken } from "@/lib/admin-jwt";

export async function requireAdminCookie(): Promise<boolean> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}
