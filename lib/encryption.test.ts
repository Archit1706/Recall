import { beforeAll, describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";
import { decryptSecret, encryptSecret, maskApiKey } from "./encryption";

beforeAll(() => {
  process.env.ENCRYPTION_KEY = randomBytes(32).toString("hex");
});

describe("encryption", () => {
  it("roundtrips", () => {
    const plain = "sk-ant-api03-very-secret-token-1234567890abcdef";
    const blob = encryptSecret(plain);
    expect(blob).not.toContain(plain);
    expect(decryptSecret(blob)).toBe(plain);
  });

  it("emits different ciphertexts for the same plaintext (random IV)", () => {
    const a = encryptSecret("hello");
    const b = encryptSecret("hello");
    expect(a).not.toBe(b);
  });

  it("rejects malformed ciphertext", () => {
    expect(() => decryptSecret("garbage")).toThrow();
  });

  it("masks api keys for display", () => {
    expect(maskApiKey("sk-ant-api03-abcdefghij")).toBe("•••• ghij");
    expect(maskApiKey("xy")).toBe("••••");
  });
});
