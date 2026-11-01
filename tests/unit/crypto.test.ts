import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  sha256,
  generateRandomToken,
  generateSecureNumericCode,
} from "@/server/lib/crypto";

describe("Crypto utilities unit tests", () => {
  it("should hash passwords using Argon2 and verify correctly", async () => {
    const raw = "SecureP@ssw0rd2026!";
    const hash = await hashPassword(raw);

    expect(hash).toBeDefined();
    expect(hash).toContain("$argon2id$");

    const valid = await verifyPassword(hash, raw);
    expect(valid).toBe(true);

    const invalid = await verifyPassword(hash, "WrongPassword!");
    expect(invalid).toBe(false);
  });

  it("should calculate deterministic SHA-256 digests", () => {
    const text = "Capstone OS Master Specification 2026";
    const digest1 = sha256(text);
    const digest2 = sha256(text);

    expect(digest1).toBe(digest2);
    expect(digest1).toHaveLength(64);
  });

  it("should generate cryptographically random tokens and numeric codes", () => {
    const token1 = generateRandomToken(32);
    const token2 = generateRandomToken(32);

    expect(token1).not.toBe(token2);
    expect(token1).toHaveLength(64); // 32 bytes hex = 64 chars

    const code = generateSecureNumericCode(6);
    expect(code).toHaveLength(6);
    expect(Number(code)).toBeGreaterThanOrEqual(100000);
    expect(Number(code)).toBeLessThanOrEqual(999999);
  });
});

