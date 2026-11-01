import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/lib/errors";
import { recordAuditLog } from "@/server/services/audit";
import {
  MilestoneStatus,
  MilestoneApprovalAction,
  ProjectRole,
  FeedbackSeverity,
  FeedbackCategory,
  FeedbackTargetType,
} from "@/generated/prisma";
import type { User, Milestone, MilestoneEvidence, MilestoneApproval } from "@/generated/prisma";

export interface CreateMilestoneInput {
  projectId: string;
  phaseId?: string | null;
  title: string;
  objective?: string;
  acceptanceCriteria?: string;
  ownerId?: string | null;
  dueDate: Date | string;
  requiresApproval?: boolean;
}

export async function createMilestone(
  actor: User,
  input: CreateMilestoneInput
): Promise<Milestone> {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: input.projectId, userId: actor.id } },
  });

  if (
    (!member || (member.role !== ProjectRole.TEAM_LEADER && member.role !== ProjectRole.SUPERVISOR)) &&
    actor.systemRole !== "SYSTEM_ADMIN"
  ) {
    throw AppError.forbidden("Only Team Leaders or Supervisors can create milestones.");
  }

  const count = await prisma.milestone.count({ where: { projectId: input.projectId } });

  const milestone = await prisma.milestone.create({
    data: {
      projectId: input.projectId,
      phaseId: input.phaseId || null,
      title: input.title.trim(),
      objective: input.objective?.trim(),
      acceptanceCriteria: input.acceptanceCriteria?.trim(),
      ownerId: input.ownerId || null,
      dueDate: new Date(input.dueDate),
      requiresApproval: input.requiresApproval !== false,
      order: count + 1,
      status: MilestoneStatus.NOT_STARTED,
    },
  });

  await prisma.activityEvent.create({
    data: {
      projectId: input.projectId,
      actorId: actor.id,
      type: "MILESTONE_CREATED",
      entityType: "Milestone",
      entityId: milestone.id,
      params: { title: milestone.title, dueDate: milestone.dueDate },
    },
  });

  return milestone;
}

export async function addMilestoneEvidence(
  actor: User,
  milestoneId: string,
  documentVersionId?: string | null,
  url?: string | null,
  note?: string | null
): Promise<MilestoneEvidence> {
  const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
  if (!milestone) throw AppError.notFound("Milestone not found");

  if (!documentVersionId && !url && !note) {
    throw AppError.badRequest("Evidence must include a document version, a URL, or descriptive notes.");
  }

  return prisma.milestoneEvidence.create({
    data: {
      milestoneId,
      documentVersionId: documentVersionId || null,
      url: url?.trim() || null,
      note: note?.trim() || null,
      addedById: actor.id,
    },
  });
}

export async function requestMilestoneApproval(
  actor: User,
  milestoneId: string,
  comment?: string
): Promise<Milestone> {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { evidence: true },
  });

  if (!milestone) throw AppError.notFound("Milestone not found");

  if (milestone.status === MilestoneStatus.COMPLETED) {
    throw AppError.badRequest("Milestone is already completed and approved.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.milestone.update({
      where: { id: milestoneId },
      data: {
        status: MilestoneStatus.AWAITING_APPROVAL,
      },
    });

    await tx.milestoneApproval.create({
      data: {
        milestoneId,
        action: MilestoneApprovalAction.REQUESTED,
        actorId: actor.id,
        comment: comment?.trim(),
      },
    });

    await tx.activityEvent.create({
      data: {
        projectId: milestone.projectId,
        actorId: actor.id,
        type: "MILESTONE_APPROVAL_REQUESTED",
        entityType: "Milestone",
        entityId: milestone.id,
        params: { title: milestone.title },
      },
    });

    return res;
  });

  return updated;
}

export async function approveMilestone(
  actor: User,
  milestoneId: string,
  comment?: string
): Promise<Milestone> {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
  });

  if (!milestone) throw AppError.notFound("Milestone not found");

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: milestone.projectId, userId: actor.id } },
  });

  if (
    (!member || member.role !== ProjectRole.SUPERVISOR) &&
    actor.systemRole !== "SYSTEM_ADMIN" &&
    actor.systemRole !== "DEPARTMENT_ADMIN"
  ) {
    throw AppError.forbidden("Only an Academic Supervisor can approve milestones.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.milestone.update({
      where: { id: milestoneId },
      data: {
        status: MilestoneStatus.COMPLETED,
        approvedAt: new Date(),
        completedAt: new Date(),
      },
    });

    await tx.milestoneApproval.create({
      data: {
        milestoneId,
        action: MilestoneApprovalAction.APPROVED,
        actorId: actor.id,
        comment: comment?.trim(),
      },
    });

    await tx.activityEvent.create({
      data: {
        projectId: milestone.projectId,
        actorId: actor.id,
        type: "MILESTONE_APPROVED",
        entityType: "Milestone",
        entityId: milestone.id,
        params: { title: milestone.title },
      },
    });

    return res;
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "MILESTONE_APPROVED",
    entityType: "Milestone",
    entityId: milestone.id,
    projectId: milestone.projectId,
    metadata: { comment },
  });

  return updated;
}

export async function requestChangesMilestone(
  actor: User,
  milestoneId: string,
  reason: string,
  severity: FeedbackSeverity = FeedbackSeverity.IMPORTANT
): Promise<Milestone> {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
  });

  if (!milestone) throw AppError.notFound("Milestone not found");

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: milestone.projectId, userId: actor.id } },
  });

  if (
    (!member || member.role !== ProjectRole.SUPERVISOR) &&
    actor.systemRole !== "SYSTEM_ADMIN" &&
    actor.systemRole !== "DEPARTMENT_ADMIN"
  ) {
    throw AppError.forbidden("Only an Academic Supervisor can request changes on milestones.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    // Automatically create a linked supervisor feedback entry (docs/14 & docs/15)
    const feedback = await tx.feedback.create({
      data: {
        projectId: milestone.projectId,
        authorId: actor.id,
        assigneeId: milestone.ownerId,
        targetType: FeedbackTargetType.MILESTONE,
        milestoneId: milestone.id,
        category: FeedbackCategory.REQUIREMENTS,
        severity,
        title: `Requested changes on milestone: ${milestone.title}`,
        body: reason.trim(),
      },
    });

    const res = await tx.milestone.update({
      where: { id: milestoneId },
      data: {
        status: MilestoneStatus.AT_RISK,
      },
    });

    await tx.milestoneApproval.create({
      data: {
        milestoneId,
        action: MilestoneApprovalAction.CHANGES_REQUESTED,
        actorId: actor.id,
        comment: reason.trim(),
        feedbackId: feedback.id,
      },
    });

    await tx.activityEvent.create({
      data: {
        projectId: milestone.projectId,
        actorId: actor.id,
        type: "MILESTONE_CHANGES_REQUESTED",
        entityType: "Milestone",
        entityId: milestone.id,
        params: { title: milestone.title, reason },
      },
    });

    return res;
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "MILESTONE_CHANGES_REQUESTED",
    entityType: "Milestone",
    entityId: milestone.id,
    projectId: milestone.projectId,
    metadata: { reason, severity },
  });

  return updated;
}

