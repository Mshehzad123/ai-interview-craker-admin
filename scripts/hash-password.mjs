#!/usr/bin/env node
/**
 * Generates a scrypt hash for ADMIN_PASSWORD_HASH.
 *
 * Usage:
 *   node scripts/hash-password.mjs "YourLongRandomPassword"
 *
 * The output is `<salt-hex>:<derived-hex>` — copy it verbatim into the
 * ADMIN_PASSWORD_HASH env var on the admin panel deployment.
 */
import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEYLEN = 64;

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error("usage: node scripts/hash-password.mjs \"<password>\"");
    process.exit(1);
  }
  if (password.length < 12) {
    console.error("Refusing to hash a password shorter than 12 chars. Use a long passphrase.");
    process.exit(1);
  }
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, KEYLEN);
  console.log(`${salt}:${derived.toString("hex")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
