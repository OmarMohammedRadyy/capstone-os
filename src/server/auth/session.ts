import { cookies } from "next/headers";
import { prisma } from "@/server/db/prisma";
import { generateRandomToken, sha256, hashIp } from "@/server/lib/crypto";
import { env } from "@/server/config/env";
import type { User } from "@/generated/prisma";

export const SESSION_COOKIE_NAME = "capstone_session";
const SESSION_TTL_DAYS = 30;

export interface SessionWithUser {
  id: string;
  userId: string;
  expiresAt: Date;
  user: User;
}

export async function createSession(
  userId: string,
  ip?: string,
  userAgent?: string
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateRandomToken(32);
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      ipHash: ip ? hashIp(ip) : null,
      userAgent: userAgent ? userAgent.slice(0, 300) : null,
    },
  });

  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production" && env.APP_URL.startsWith("https://"),
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionFromCookies(): Promise<SessionWithUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = sha256(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  // Check if session is expired or revoked
  if (session.expiresAt < new Date() || session.revokedAt !== null) {
    return null;
  }

  if (!session.user.isActive) {
    return null;
  }

  // Update last seen timestamp periodically (every 10 minutes)
  const now = new Date();
  if (now.getTime() - session.lastSeenAt.getTime() > 10 * 60 * 1000) {
    await prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: now },
    });
  }

  return session;
}

export async function validateSessionToken(token: string): Promise<SessionWithUser | null> {
  const tokenHash = sha256(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || session.revokedAt !== null || !session.user.isActive) {
    return null;
  }

  return session;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSessionFromCookies();
  return session ? session.user : null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function revokeSessionByToken(token: string): Promise<void> {
  const tokenHash = sha256(token);
  await prisma.session.updateMany({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
