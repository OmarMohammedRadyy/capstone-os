import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";
import { env } from "@/server/config/env";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

const dbUrl = env.NODE_ENV === "test" && env.TEST_DATABASE_URL ? env.TEST_DATABASE_URL : env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: dbUrl });

export const prisma: PrismaClient =
  global.prismaGlobal ??
  new PrismaClient({
    adapter,
    log: env.LOG_LEVEL === "debug" ? ["query", "error", "warn"] : ["error", "warn"],
  });

if (env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}
