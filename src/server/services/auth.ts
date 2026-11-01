import { prisma } from "@/server/db/prisma";
import { hashPassword, verifyPassword, sha256, generateRandomToken } from "@/server/lib/crypto";
import { createSession, setSessionCookie, clearSessionCookie, getSessionFromCookies } from "@/server/auth/session";
import { recordAuditLog } from "@/server/services/audit";
import { AppError } from "@/server/lib/errors";
import { env } from "@/server/config/env";
import type { User } from "@/generated/prisma";

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function login(
  email: string,
  pass: string,
  ip?: string,
  userAgent?: string
): Promise<{ user: User }> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw AppError.badRequest("Invalid email or password", "UNAUTHORIZED");
  }

  // Check lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw AppError.badRequest(
      "Account temporarily locked due to multiple failed login attempts. Please try again later.",
      "RATE_LIMITED"
    );
  }

  const isValid = await verifyPassword(pass, user.passwordHash);

  if (!isValid) {
    const failedLogins = user.failedLogins + 1;
    const lockedUntil = failedLogins >= MAX_FAILED_LOGINS ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLogins,
        lockedUntil,
      },
    });

    await recordAuditLog({
      actorId: user.id,
      action: "USER_LOGIN_FAILED",
      entityType: "User",
      entityId: user.id,
      metadata: { failedLogins, lockedUntil },
    });

    throw AppError.badRequest("Invalid email or password", "UNAUTHORIZED");
  }

  // Reset failed logins on success & update last login
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLogins: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });

  const { token, expiresAt } = await createSession(user.id, ip, userAgent);
  await setSessionCookie(token, expiresAt);

  await recordAuditLog({
    actorId: user.id,
    action: "USER_LOGIN_SUCCESS",
    entityType: "User",
    entityId: user.id,
  });

  return { user: updatedUser };
}

export async function register(
  email: string,
  name: string,
  pass: string,
  locale: string = "ar"
): Promise<{ user: User }> {
  if (!env.REGISTRATION_OPEN) {
    throw AppError.badRequest("Self-registration is currently disabled", "FORBIDDEN");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw AppError.conflict("An account with this email address already exists.");
  }

  if (pass.length < 8) {
    throw AppError.badRequest("Password must be at least 8 characters long.");
  }

  const passwordHash = await hashPassword(pass);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: name.trim(),
      passwordHash,
      locale: locale === "ar" ? "ar" : "en",
    },
  });

  const { token, expiresAt } = await createSession(user.id);
  await setSessionCookie(token, expiresAt);

  await recordAuditLog({
    actorId: user.id,
    action: "USER_REGISTERED",
    entityType: "User",
    entityId: user.id,
  });

  return { user };
}

export async function logout(): Promise<void> {
  const session = await getSessionFromCookies();
  if (session) {
    await prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    await recordAuditLog({
      actorId: session.userId,
      action: "USER_LOGOUT",
      entityType: "User",
      entityId: session.userId,
    });
  }

  await clearSessionCookie();
}

export async function requestPasswordReset(email: string): Promise<{ token?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    // Avoid user enumeration
    return {};
  }

  const rawToken = generateRandomToken(32);
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  await recordAuditLog({
    actorId: user.id,
    action: "PASSWORD_RESET_REQUESTED",
    entityType: "User",
    entityId: user.id,
  });

  return { token: rawToken };
}

export async function resetPassword(token: string, newPass: string): Promise<void> {
  if (newPass.length < 8) {
    throw AppError.badRequest("Password must be at least 8 characters long.");
  }

  const tokenHash = sha256(token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt !== null || resetToken.expiresAt < new Date()) {
    throw AppError.badRequest("Password reset link is invalid or has expired.", "BAD_REQUEST");
  }

  const passwordHash = await hashPassword(newPass);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash,
        failedLogins: 0,
        lockedUntil: null,
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    // Revoke all existing sessions on password reset for security
    prisma.session.updateMany({
      where: { userId: resetToken.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  await recordAuditLog({
    actorId: resetToken.userId,
    action: "PASSWORD_RESET_COMPLETED",
    entityType: "User",
    entityId: resetToken.userId,
  });
}

