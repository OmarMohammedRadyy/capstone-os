import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/lib/errors";
import { recordAuditLog } from "@/server/services/audit";
import {
  FeedbackStatus,
  FeedbackSeverity,
  FeedbackCategory,
  FeedbackTargetType,
  ProjectRole,
} from "@/generated/prisma";
import type { User, Feedback, FeedbackEvent } from "@/generated/prisma";

export interface CreateFeedbackInput {
  projectId: string;
  category: FeedbackCategory;
  severity: FeedbackSeverity;
  title: string;
  body: string;
  targetType: FeedbackTargetType;
  milestoneId?: string | null;
  taskId?: string | null;
  documentId?: string | null;
  documentVersionId?: string | null;
  submissionId?: string | null;
  screenRef?: string | null;
  assigneeId?: string | null;
  dueDate?: Date | string | null;
}

export async function createFeedback(
  actor: User,
  input: CreateFeedbackInput
): Promise<Feedback> {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: input.projectId, userId: actor.id } },
  });

  if (
    (!member || member.role !== ProjectRole.SUPERVISOR) &&
    actor.systemRole !== "SYSTEM_ADMIN" &&
    actor.systemRole !== "DEPARTMENT_ADMIN"
  ) {
    throw AppError.forbidden("Only Academic Supervisors can create feedback items.");
  }

  const feedback = await prisma.$transaction(async (tx) => {
    const item = await tx.feedback.create({
      data: {
        projectId: input.projectId,
        authorId: actor.id,
        assigneeId: input.assigneeId || null,
        targetType: input.targetType,
        category: input.category,
        severity: input.severity,
        title: input.title.trim(),
        body: input.body.trim(),
        milestoneId: input.milestoneId || null,
        taskId: input.taskId || null,
        documentId: input.documentId || null,
        documentVersionId: input.documentVersionId || null,
        submissionId: input.submissionId || null,
        screenRef: input.screenRef?.trim() || null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        status: FeedbackStatus.OPEN,
      },
    });

    await tx.feedbackEvent.create({
      data: {
        feedbackId: item.id,
        toStatus: FeedbackStatus.OPEN,
        actorId: actor.id,
        note: "Feedback created by supervisor",
      },
    });

    await tx.activityEvent.create({
      data: {
        projectId: input.projectId,
        actorId: actor.id,
        type: "FEEDBACK_CREATED",
        entityType: "Feedback",
        entityId: item.id,
        params: { title: item.title, severity: item.severity, category: item.category },
      },
    });

    return item;
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "FEEDBACK_CREATED",
    entityType: "Feedback",
    entityId: feedback.id,
    projectId: feedback.projectId,
    metadata: { severity: feedback.severity, category: feedback.category },
  });

  return feedback;
}

export async function resolveFeedback(
  actor: User,
  feedbackId: string,
  resolutionNote: string,
  evidenceDocumentVersionId?: string | null,
  evidenceUrl?: string | null
): Promise<Feedback> {
  const feedback = await prisma.feedback.findUnique({ where: { id: feedbackId } });
  if (!feedback) throw AppError.notFound("Feedback not found");

  if (feedback.status === FeedbackStatus.VERIFIED) {
    throw AppError.badRequest("Feedback is already verified and closed.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.feedback.update({
      where: { id: feedbackId },
      data: {
        status: FeedbackStatus.AWAITING_VERIFICATION,
        resolutionNote: resolutionNote.trim(),
        evidenceDocumentVersionId: evidenceDocumentVersionId || null,
        evidenceUrl: evidenceUrl?.trim() || null,
        resolvedAt: new Date(),
      },
    });

    await tx.feedbackEvent.create({
      data: {
        feedbackId,
        fromStatus: feedback.status,
        toStatus: FeedbackStatus.AWAITING_VERIFICATION,
        actorId: actor.id,
        note: resolutionNote.trim(),
      },
    });

    await tx.activityEvent.create({
      data: {
        projectId: feedback.projectId,
        actorId: actor.id,
        type: "FEEDBACK_RESOLVED",
        entityType: "Feedback",
        entityId: feedback.id,
        params: { title: feedback.title },
      },
    });

    return res;
  });

  return updated;
}

export async function verifyFeedback(
  actor: User,
  feedbackId: string,
  verificationNote?: string
): Promise<Feedback> {
  const feedback = await prisma.feedback.findUnique({ where: { id: feedbackId } });
  if (!feedback) throw AppError.notFound("Feedback not found");

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: feedback.projectId, userId: actor.id } },
  });

  if (
    (!member || member.role !== ProjectRole.SUPERVISOR) &&
    actor.systemRole !== "SYSTEM_ADMIN" &&
    actor.systemRole !== "DEPARTMENT_ADMIN"
  ) {
    throw AppError.forbidden("Only an Academic Supervisor can verify feedback.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.feedback.update({
      where: { id: feedbackId },
      data: {
        status: FeedbackStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedById: actor.id,
      },
    });

    await tx.feedbackEvent.create({
      data: {
        feedbackId,
        fromStatus: feedback.status,
        toStatus: FeedbackStatus.VERIFIED,
        actorId: actor.id,
        note: verificationNote?.trim() || "Resolution verified and approved by supervisor.",
      },
    });

    await tx.activityEvent.create({
      data: {
        projectId: feedback.projectId,
        actorId: actor.id,
        type: "FEEDBACK_VERIFIED",
        entityType: "Feedback",
        entityId: feedback.id,
        params: { title: feedback.title },
      },
    });

    return res;
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "FEEDBACK_VERIFIED",
    entityType: "Feedback",
    entityId: feedback.id,
    projectId: feedback.projectId,
  });

  return updated;
}

export async function reopenFeedback(
  actor: User,
  feedbackId: string,
  reopenReason: string
): Promise<Feedback> {
  const feedback = await prisma.feedback.findUnique({ where: { id: feedbackId } });
  if (!feedback) throw AppError.notFound("Feedback not found");

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: feedback.projectId, userId: actor.id } },
  });

  if (
    (!member || member.role !== ProjectRole.SUPERVISOR) &&
    actor.systemRole !== "SYSTEM_ADMIN" &&
    actor.systemRole !== "DEPARTMENT_ADMIN"
  ) {
    throw AppError.forbidden("Only an Academic Supervisor can reopen feedback.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.feedback.update({
      where: { id: feedbackId },
      data: {
        status: FeedbackStatus.OPEN,
        reopenCount: { increment: 1 },
      },
    });

    await tx.feedbackEvent.create({
      data: {
        feedbackId,
        fromStatus: feedback.status,
        toStatus: FeedbackStatus.OPEN,
        actorId: actor.id,
        note: `Reopened by supervisor: ${reopenReason.trim()}`,
      },
    });

    await tx.activityEvent.create({
      data: {
        projectId: feedback.projectId,
        actorId: actor.id,
        type: "FEEDBACK_REOPENED",
        entityType: "Feedback",
        entityId: feedback.id,
        params: { title: feedback.title, reason: reopenReason },
      },
    });

    return res;
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "FEEDBACK_REOPENED",
    entityType: "Feedback",
    entityId: feedback.id,
    projectId: feedback.projectId,
    metadata: { reason: reopenReason },
  });

  return updated;
}

