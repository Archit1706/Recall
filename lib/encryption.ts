import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * AES-256-GCM. Encrypts a UTF-8 string and emits a self-contained "iv:tag:ciphertext"
 * hex blob. Designed for storing per-user secrets (Anthropic API key) at rest.
 *
 * ENCRYPTION_KEY must be a 32-byte hex string (64 hex chars). Generate with:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const k = process.env.ENCRYPTION_KEY;
  if (!k) throw new Error("ENCRYPTION_KEY is not set");
  const buf = Buffer.from(k, "hex");
  if (buf.length !== 32) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes hex (64 chars)");
  }
  return buf;
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), tag.toString("hex"), ct.toString("hex")].join(":");
}

export function decryptSecret(blob: string): string {
  const [ivHex, tagHex, ctHex] = blob.split(":");
  if (!ivHex || !tagHex || !ctHex) throw new Error("Malformed ciphertext");
  const decipher = createDecipheriv(ALGO, getKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const pt = Buffer.concat([decipher.update(Buffer.from(ctHex, "hex")), decipher.final()]);
  return pt.toString("utf8");
}

/** Returns the last 4 chars (after stripping common prefixes) for display. */
export function maskApiKey(key: string): string {
  const trimmed = key.replace(/^sk-ant-[a-z0-9]+-/i, "");
  if (trimmed.length <= 4) return "••••";
  return "•••• " + trimmed.slice(-4);
}
