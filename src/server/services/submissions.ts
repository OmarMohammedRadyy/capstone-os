import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/lib/errors";
import { recordAuditLog } from "@/server/services/audit";
import {
  SubmissionStatus,
  RequirementType,
  SubmissionEventType,
  ProjectRole,
} from "@/generated/prisma";
import type { User, Submission, SubmissionRequirement, SubmissionSnapshot } from "@/generated/prisma";

export interface CreateSubmissionInput {
  projectId: string;
  title: string;
  description?: string;
  deadline: Date | string;
  ownerId?: string | null;
  requiresSupervisorApproval?: boolean;
  requirements?: Array<{
    type: RequirementType;
    title: string;
    description?: string;
    required?: boolean;
    documentCategory?: any;
    order?: number;
  }>;
}

export async function createSubmission(
  actor: User,
  input: CreateSubmissionInput
): Promise<Submission> {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: input.projectId, userId: actor.id } },
  });

  if (
    (!member || (member.role !== ProjectRole.TEAM_LEADER && member.role !== ProjectRole.SUPERVISOR)) &&
    actor.systemRole !== "SYSTEM_ADMIN"
  ) {
    throw AppError.forbidden("Only Team Leaders or Supervisors can create submission deadlines.");
  }

  const submission = await prisma.$transaction(async (tx) => {
    const s = await tx.submission.create({
      data: {
        projectId: input.projectId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        deadline: new Date(input.deadline),
        ownerId: input.ownerId || actor.id,
        requiresSupervisorApproval: input.requiresSupervisorApproval !== false,
        status: SubmissionStatus.PREPARING,
      },
    });

    if (input.requirements && input.requirements.length > 0) {
      await tx.submissionRequirement.createMany({
        data: input.requirements.map((r, idx) => ({
          submissionId: s.id,
          type: r.type,
          title: r.title.trim(),
          description: r.description?.trim() || null,
          required: r.required !== false,
          documentCategory: r.documentCategory || null,
          order: r.order || idx + 1,
        })),
      });
    }

    await tx.submissionEvent.create({
      data: {
        submissionId: s.id,
        type: SubmissionEventType.CREATED,
        actorId: actor.id,
        note: "Submission deadline created",
      },
    });

    return s;
  });

  return submission;
}

export async function completeRequirement(
  actor: User,
  requirementId: string,
  completed: boolean,
  documentVersionId?: string | null,
  url?: string | null
): Promise<SubmissionRequirement> {
  const req = await prisma.submissionRequirement.findUnique({
    where: { id: requirementId },
    include: { submission: true },
  });

  if (!req) throw AppError.notFound("Requirement not found");

  if (req.submission.status === SubmissionStatus.FROZEN || req.submission.status === SubmissionStatus.SUBMITTED) {
    throw AppError.badRequest("Cannot modify requirements of a frozen or submitted deliverable.", "SUBMISSION_LOCKED");
  }

  return prisma.submissionRequirement.update({
    where: { id: requirementId },
    data: {
      completed,
      completedAt: completed ? new Date() : null,
      completedById: completed ? actor.id : null,
      documentVersionId: documentVersionId || req.documentVersionId,
      url: url || req.url,
    },
  });
}

export async function freezeSubmission(
  actor: User,
  submissionId: string
): Promise<SubmissionSnapshot> {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      requirements: {
        include: { documentVersion: true },
      },
      snapshots: true,
    },
  });

  if (!submission) throw AppError.notFound("Submission not found");

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: submission.projectId, userId: actor.id } },
  });

  if (
    (!member || member.role !== ProjectRole.TEAM_LEADER) &&
    actor.systemRole !== "SYSTEM_ADMIN"
  ) {
    throw AppError.forbidden("Only Team Leaders can freeze submissions.", "FORBIDDEN");
  }

  // Validate mandatory requirements (docs/21)
  const incompleteMandatory = submission.requirements.filter((r) => r.required && !r.completed);
  if (incompleteMandatory.length > 0) {
    throw AppError.badRequest(
      `Cannot freeze submission: ${incompleteMandatory.length} mandatory requirement(s) are incomplete.`,
      "SUBMISSION_REQUIREMENTS_INCOMPLETE",
      { incompleteItems: incompleteMandatory.map((i) => i.title) }
    );
  }

  const nextSequence = submission.snapshots.length + 1;
  const total = submission.requirements.length;
  const completedCount = submission.requirements.filter((r) => r.completed).length;
  const readiness = total > 0 ? Math.round((completedCount / total) * 100) : 100;

  const snapshot = await prisma.$transaction(async (tx) => {
    // 1. Create snapshot metadata
    const snap = await tx.submissionSnapshot.create({
      data: {
        submissionId: submission.id,
        sequence: nextSequence,
        readiness,
        createdById: actor.id,
      },
    });

    // 2. Freeze each requirement as immutable artifact referencing exact document versions
    for (const r of submission.requirements) {
      await tx.submissionArtifact.create({
        data: {
          snapshotId: snap.id,
          submissionId: submission.id,
          requirementId: r.id,
          label: r.title,
          requirementType: r.type,
          documentVersionId: r.documentVersionId || null,
          url: r.url || null,
          checksumSha256: r.documentVersion?.checksumSha256 || null,
          completed: r.completed,
        },
      });
    }

    // 3. Update submission status to FROZEN
    await tx.submission.update({
      where: { id: submission.id },
      data: {
        status: SubmissionStatus.FROZEN,
        frozenAt: new Date(),
        frozenById: actor.id,
      },
    });

    // 4. Record events
    await tx.submissionEvent.create({
      data: {
        submissionId: submission.id,
        type: SubmissionEventType.FROZEN,
        actorId: actor.id,
        note: `Package frozen with snapshot #${nextSequence}`,
      },
    });

    await tx.activityEvent.create({
      data: {
        projectId: submission.projectId,
        actorId: actor.id,
        type: "SUBMISSION_FROZEN",
        entityType: "Submission",
        entityId: submission.id,
        params: { title: submission.title, sequence: nextSequence },
      },
    });

    return snap;
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "SUBMISSION_FROZEN",
    entityType: "Submission",
    entityId: submission.id,
    projectId: submission.projectId,
    metadata: { sequence: nextSequence, readiness },
  });

  return snapshot;
}

export async function unfreezeSubmission(
  actor: User,
  submissionId: string,
  reason: string
): Promise<Submission> {
  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
  if (!submission) throw AppError.notFound("Submission not found");

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: submission.projectId, userId: actor.id } },
  });

  if (
    (!member || member.role !== ProjectRole.SUPERVISOR) &&
    actor.systemRole !== "SYSTEM_ADMIN"
  ) {
    throw AppError.forbidden("Only an Academic Supervisor can authorize unfreezing a deliverable.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.submission.update({
      where: { id: submissionId },
      data: {
        status: SubmissionStatus.PREPARING,
        frozenAt: null,
        frozenById: null,
      },
    });

    await tx.submissionEvent.create({
      data: {
        submissionId: submission.id,
        type: SubmissionEventType.UNFROZEN,
        actorId: actor.id,
        note: `Unfrozen by supervisor: ${reason.trim()}`,
      },
    });

    await tx.activityEvent.create({
      data: {
        projectId: submission.projectId,
        actorId: actor.id,
        type: "SUBMISSION_UNFROZEN",
        entityType: "Submission",
        entityId: submission.id,
        params: { title: submission.title, reason },
      },
    });

    return res;
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "SUBMISSION_UNFROZEN",
    entityType: "Submission",
    entityId: submission.id,
    projectId: submission.projectId,
    metadata: { reason },
  });

  return updated;
}

