import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/headers cookies store
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    set: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  })),
}));

import { prisma } from "@/server/db/prisma";
import { login, register } from "@/server/services/auth";
import { createSession, validateSessionToken } from "@/server/auth/session";

describe("Authentication & Session Lifecycle Integration Tests", () => {
  const testEmail = `test.user.${Date.now()}@example.edu`;
  const testPassword = "Capstone2026!Secure";

  it("should register a new student user and create password hash", async () => {
    const { user } = await register(testEmail, "Test Student", testPassword, "ar");

    expect(user).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.passwordHash).toContain("$argon2id$");

    // Attempting duplicate registration should fail
    await expect(
      register(testEmail, "Duplicate Student", testPassword, "ar")
    ).rejects.toThrow("already exists");
  });

  it("should authenticate with correct credentials and issue session", async () => {
    const { user } = await login(testEmail, testPassword, "127.0.0.1", "Vitest-Agent");
    expect(user).toBeDefined();
    expect(user.email).toBe(testEmail);

    // Create session and validate token
    const { token } = await createSession(user.id, "127.0.0.1", "Vitest-Agent");
    const validated = await validateSessionToken(token);

    expect(validated).toBeDefined();
    expect(validated?.user.id).toBe(user.id);
  });

  it("should fail authentication on invalid password", async () => {
    await expect(
      login(testEmail, "WrongPassword!", "127.0.0.1", "Vitest-Agent")
    ).rejects.toThrow();
  });

  it("should lock account after 5 consecutive failed login attempts", async () => {
    const lockoutEmail = `lockout.${Date.now()}@example.edu`;
    await register(lockoutEmail, "Lockout Target", testPassword, "en");

    // Fail 5 times
    for (let i = 0; i < 5; i++) {
      try {
        await login(lockoutEmail, "BadPassword", "127.0.0.1");
      } catch {
        // Expected failure
      }
    }

    // 6th attempt should be blocked with rate limiting / locked message
    await expect(
      login(lockoutEmail, testPassword, "127.0.0.1")
    ).rejects.toThrow(/temporarily locked/);
  });
});
