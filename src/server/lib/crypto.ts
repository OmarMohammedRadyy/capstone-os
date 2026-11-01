import crypto from "node:crypto";
import * as argon2 from "@node-rs/argon2";
import { env } from "@/server/config/env";

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

export async function verifyPassword(passwordOrHash: string, hashOrPassword: string): Promise<boolean> {
  try {
    const isFirstHash = passwordOrHash.startsWith("$argon2");
    const hash = isFirstHash ? passwordOrHash : hashOrPassword;
    const password = isFirstHash ? hashOrPassword : passwordOrHash;
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export function generateRandomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function generateSecureNumericCode(digits = 6): string {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  const num = crypto.randomInt(min, max + 1);
  return String(num);
}

export function sha256(data: string | Buffer): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function hashIp(ip: string): string {
  return crypto.createHmac("sha256", env.SESSION_SECRET).update(ip).digest("hex");
}
