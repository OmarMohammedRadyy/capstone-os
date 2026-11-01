import { env } from "@/server/config/env";

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  message: string;
  requestId?: string;
  userId?: string;
  projectId?: string;
  durationMs?: number;
  error?: unknown;
  meta?: Record<string, unknown>;
}

const levelWeights: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldLog(level: LogLevel): boolean {
  return levelWeights[level] >= levelWeights[env.LOG_LEVEL];
}

function formatLog(level: LogLevel, payload: LogPayload) {
  const { message, requestId, userId, projectId, durationMs, error, meta } = payload;
  
  const serializedError =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: env.NODE_ENV !== "production" ? error.stack : undefined,
        }
      : error;

  const logObject = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(requestId && { requestId }),
    ...(userId && { userId }),
    ...(projectId && { projectId }),
    ...(durationMs !== undefined && { durationMs }),
    ...(serializedError ? { error: serializedError } : {}),
    ...(meta ? { meta } : {}),
  };

  if (env.NODE_ENV === "development") {
    const prefix = `[${logObject.timestamp}] [${level.toUpperCase()}]`;
    const ctx = [requestId && `req:${requestId}`, projectId && `proj:${projectId}`, userId && `user:${userId}`]
      .filter(Boolean)
      .join(" ");
    const ctxStr = ctx ? `(${ctx}) ` : "";
    
    if (level === "error") {
      console.error(`${prefix} ${ctxStr}${message}`, serializedError ?? "", meta ?? "");
    } else if (level === "warn") {
      console.warn(`${prefix} ${ctxStr}${message}`, meta ?? "");
    } else {
      console.log(`${prefix} ${ctxStr}${message}`, meta ?? "");
    }
  } else {
    // Structured JSON for production
    const stream = level === "error" ? console.error : console.log;
    stream(JSON.stringify(logObject));
  }
}

export const logger = {
  debug: (payload: LogPayload | string) => {
    if (shouldLog("debug")) {
      formatLog("debug", typeof payload === "string" ? { message: payload } : payload);
    }
  },
  info: (payload: LogPayload | string) => {
    if (shouldLog("info")) {
      formatLog("info", typeof payload === "string" ? { message: payload } : payload);
    }
  },
  warn: (payload: LogPayload | string) => {
    if (shouldLog("warn")) {
      formatLog("warn", typeof payload === "string" ? { message: payload } : payload);
    }
  },
  error: (payload: LogPayload | string, err?: unknown) => {
    if (shouldLog("error")) {
      if (typeof payload === "string") {
        formatLog("error", { message: payload, error: err });
      } else {
        formatLog("error", payload);
      }
    }
  },
};
