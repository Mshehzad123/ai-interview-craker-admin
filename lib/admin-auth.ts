import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const KEYLEN = 64;

/**
 * Hashes a password with a random salt using scrypt.
 * Store the output in ADMIN_PASSWORD_HASH env var.
 *
 * Usage (run once in a Node REPL or script):
 *   node -e "
 *     const {scrypt,randomBytes}=require('crypto');
 *     const {promisify}=require('util');
 *     const s=randomBytes(16).toString('hex');
 *     promisify(scrypt)('YourPassword',s,64)
 *       .then(k=>console.log(s+':'+k.toString('hex')));
 *   "
 */
export async function hashAdminPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

/**
 * Verifies a password against a stored hash.
 * Accepts two formats:
 *  - scrypt  → "salt:derivedHex"  (preferred, set in ADMIN_PASSWORD_HASH)
 *  - legacy  → plain text         (from ADMIN_PASSWORD — deprecated)
 */
export async function verifyAdminPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [salt, storedHex] = stored.split(":");

  // Plain-text comparison path for legacy ADMIN_PASSWORD env var.
  // Warn and allow, but guide operators to upgrade.
  if (!storedHex) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[admin-auth] ADMIN_PASSWORD is plain text. " +
          "Generate a scrypt hash and store it in ADMIN_PASSWORD_HASH to remove this warning."
      );
    }
    const a = Buffer.from(password);
    const b = Buffer.from(stored);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  // scrypt verification
  try {
    const derived = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
    const storedBuf = Buffer.from(storedHex, "hex");
    if (derived.length !== storedBuf.length) return false;
    return timingSafeEqual(derived, storedBuf);
  } catch {
    return false;
  }
}
