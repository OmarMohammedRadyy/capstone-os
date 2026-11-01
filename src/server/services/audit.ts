import { prisma } from "@/server/db/prisma";
import { logger } from "@/server/lib/logger";

export interface CreateAuditLogParams {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  projectId?: string | null;
  requestId?: string | null;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
  ipHash?: string | null;
}

export async function recordAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        projectId: params.projectId ?? null,
        requestId: params.requestId ?? null,
        before: params.before ? (params.before as object) : undefined,
        after: params.after ? (params.after as object) : undefined,
        metadata: params.metadata ? (params.metadata as object) : undefined,
        ipHash: params.ipHash ?? null,
      },
    });
  } catch (error) {
    // Audit log failure should be logged critically
    logger.error({
      message: "Failed to write audit log entry",
      error,
      meta: { action: params.action, entityType: params.entityType, entityId: params.entityId },
    });
  }
}

