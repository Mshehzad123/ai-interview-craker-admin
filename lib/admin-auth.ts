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
 * Verifies a password against a stored scrypt hash of the form `salt:derivedHex`.
 *
 * Plain-text fallback was REMOVED. Operators must run
 * `node scripts/hash-password.mjs "<password>"` and store the output in
 * `ADMIN_PASSWORD_HASH`. A malformed hash (no `:` or wrong length) is rejected.
 */
export async function verifyAdminPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [salt, storedHex] = stored.split(":");
  if (!salt || !storedHex || storedHex.length !== KEYLEN * 2) {
    if (process.env.NODE_ENV !== "test") {
      console.error(
        "[admin-auth] ADMIN_PASSWORD_HASH is malformed. Expected format: '<salt-hex>:<derived-hex>'. " +
          "Run `node scripts/hash-password.mjs \"<password>\"` to generate a valid value."
      );
    }
    return false;
  }

  try {
    const derived = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
    const storedBuf = Buffer.from(storedHex, "hex");
    if (derived.length !== storedBuf.length) return false;
    return timingSafeEqual(derived, storedBuf);
  } catch {
    return false;
  }
}
