import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  TEST_DATABASE_URL: z.string().optional(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
  
  // Storage
  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  STORAGE_LOCAL_DIR: z.string().default("./storage"),
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_REGION: z.string().default("us-east-1"),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  UPLOAD_MAX_MB: z.coerce.number().positive().default(25),
  
  // Email
  EMAIL_PROVIDER: z.enum(["log", "smtp"]).default("log"),
  EMAIL_FROM: z.string().default("Capstone OS <no-reply@example.edu>"),
  EMAIL_PROVIDER_SMTP_HOST: z.string().optional(),
  EMAIL_PROVIDER_SMTP_PORT: z.coerce.number().optional(),
  EMAIL_PROVIDER_SMTP_USER: z.string().optional(),
  EMAIL_PROVIDER_SMTP_PASSWORD: z.string().optional(),
  
  // Jobs & Auth
  JOBS_INLINE_WORKER: z.enum(["true", "false"]).default("true").transform((v) => v === "true"),
  REGISTRATION_OPEN: z.enum(["true", "false"]).default("true").transform((v) => v === "true"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  
  // Optional
  REDIS_URL: z.string().optional(),
  ERROR_TRACKING_DSN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:", JSON.stringify(result.error.format(), null, 2));
    throw new Error("Invalid environment configuration. Check your .env file.");
  }
  return result.data;
}

export const env = parseEnv();
