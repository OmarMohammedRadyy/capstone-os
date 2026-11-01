import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/lib/errors";
import { recordAuditLog } from "@/server/services/audit";
import { DecisionStatus } from "@/generated/prisma";
import type { User, Decision, DecisionOption } from "@/generated/prisma";

export interface CreateDecisionInput {
  projectId: string;
  title: string;
  context: string;
  chosenOption?: string;
  rationale?: string;
  consequences?: string;
  decidedAt?: Date | string | null;
  impactedModules?: string[];
  options?: Array<{ title: string; pros?: string; cons?: string }>;
  meetingId?: string | null;
}

export async function createDecision(
  actor: User,
  input: CreateDecisionInput
): Promise<Decision> {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: input.projectId, userId: actor.id } },
  });

  if (!member || !member.active) {
    if (actor.systemRole !== "SYSTEM_ADMIN") {
      throw AppError.forbidden("Permission denied.");
    }
  }

  const decision = await prisma.$transaction(async (tx) => {
    const updatedProject = await tx.project.update({
      where: { id: input.projectId },
      data: { decisionSequence: { increment: 1 } },
      select: { decisionSequence: true },
    });

    const d = await tx.decision.create({
      data: {
        projectId: input.projectId,
        number: updatedProject.decisionSequence,
        title: input.title.trim(),
        context: input.context.trim(),
        chosenOption: input.chosenOption?.trim() || null,
        rationale: input.rationale?.trim() || null,
        consequences: input.consequences?.trim() || null,
        status: input.chosenOption ? DecisionStatus.ACCEPTED : DecisionStatus.PROPOSED,
        ownerId: actor.id,
        decidedAt: input.decidedAt ? new Date(input.decidedAt) : null,
        impactedModules: input.impactedModules || [],
        meetingId: input.meetingId || null,
      },
    });

    if (input.options && input.options.length > 0) {
      await tx.decisionOption.createMany({
        data: input.options.map((opt, idx) => ({
          decisionId: d.id,
          title: opt.title.trim(),
          pros: opt.pros?.trim() || null,
          cons: opt.cons?.trim() || null,
          order: idx + 1,
        })),
      });
    }

    // First revision snapshot
    await tx.decisionRevision.create({
      data: {
        decisionId: d.id,
        revision: 1,
        editorId: actor.id,
        snapshot: {
          title: d.title,
          context: d.context,
          chosenOption: d.chosenOption,
          rationale: d.rationale,
          consequences: d.consequences,
          status: d.status,
          options: input.options || [],
        },
      },
    });

    await tx.activityEvent.create({
      data: {
        projectId: input.projectId,
        actorId: actor.id,
        type: "DECISION_RECORDED",
        entityType: "Decision",
        entityId: d.id,
        params: { number: d.number, title: d.title, status: d.status },
      },
    });

    return d;
  });

  return decision;
}

export async function supersedeDecision(
  actor: User,
  oldDecisionId: string,
  newDecisionInput: CreateDecisionInput
): Promise<Decision> {
  const old = await prisma.decision.findUnique({ where: { id: oldDecisionId } });
  if (!old) throw AppError.notFound("Original decision not found");

  const newDecision = await createDecision(actor, newDecisionInput);

  await prisma.$transaction([
    prisma.decision.update({
      where: { id: oldDecisionId },
      data: {
        status: DecisionStatus.SUPERSEDED,
        supersededById: newDecision.id,
      },
    }),
    prisma.activityEvent.create({
      data: {
        projectId: old.projectId,
        actorId: actor.id,
        type: "DECISION_SUPERSEDED",
        entityType: "Decision",
        entityId: old.id,
        params: {
          oldNumber: old.number,
          newNumber: newDecision.number,
        },
      },
    }),
  ]);

  return newDecision;
}

