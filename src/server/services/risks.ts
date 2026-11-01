import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/lib/errors";
import { recordAuditLog } from "@/server/services/audit";
import { RiskStatus, RiskCategory, IssueStatus, IssueSeverity } from "@/generated/prisma";
import type { User, Risk, Issue } from "@/generated/prisma";

export interface CreateRiskInput {
  projectId: string;
  title: string;
  description?: string;
  category?: RiskCategory;
  probability: number; // 1-5
  impact: number;      // 1-5
  mitigation?: string;
  contingency?: string;
  trigger?: string;
  ownerId?: string | null;
}

export interface CreateIssueInput {
  projectId: string;
  title: string;
  description?: string;
  severity: IssueSeverity;
  isBlocker?: boolean;
  riskId?: string | null;
  ownerId?: string | null;
  rootCause?: string;
  linkedTaskIds?: string[];
}

export async function createRisk(
  actor: User,
  input: CreateRiskInput
): Promise<Risk> {
  if (input.probability < 1 || input.probability > 5 || input.impact < 1 || input.impact > 5) {
    throw AppError.badRequest("Probability and impact must be integer values between 1 and 5.");
  }

  const risk = await prisma.risk.create({
    data: {
      projectId: input.projectId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      category: input.category || RiskCategory.OTHER,
      probability: input.probability,
      impact: input.impact,
      mitigation: input.mitigation?.trim() || null,
      contingency: input.contingency?.trim() || null,
      trigger: input.trigger?.trim() || null,
      ownerId: input.ownerId || actor.id,
      status: RiskStatus.OPEN,
    },
  });

  await prisma.activityEvent.create({
    data: {
      projectId: input.projectId,
      actorId: actor.id,
      type: "RISK_IDENTIFIED",
      entityType: "Risk",
      entityId: risk.id,
      params: {
        title: risk.title,
        exposure: risk.probability * risk.impact,
      },
    },
  });

  return risk;
}

export async function updateRiskStatus(
  actor: User,
  riskId: string,
  status: RiskStatus
): Promise<Risk> {
  const risk = await prisma.risk.findUnique({ where: { id: riskId } });
  if (!risk) throw AppError.notFound("Risk not found");

  return prisma.risk.update({
    where: { id: riskId },
    data: {
      status,
      closedAt: status === RiskStatus.CLOSED ? new Date() : null,
    },
  });
}

export async function createIssue(
  actor: User,
  input: CreateIssueInput
): Promise<Issue> {
  const issue = await prisma.$transaction(async (tx) => {
    const item = await tx.issue.create({
      data: {
        projectId: input.projectId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        severity: input.severity,
        isBlocker: input.isBlocker || false,
        riskId: input.riskId || null,
        ownerId: input.ownerId || actor.id,
        rootCause: input.rootCause?.trim() || null,
        status: IssueStatus.OPEN,
      },
    });

    if (input.linkedTaskIds && input.linkedTaskIds.length > 0) {
      await tx.issueTask.createMany({
        data: input.linkedTaskIds.map((taskId) => ({
          issueId: item.id,
          taskId,
        })),
        skipDuplicates: true,
      });
    }

    await tx.activityEvent.create({
      data: {
        projectId: input.projectId,
        actorId: actor.id,
        type: "ISSUE_LOGGED",
        entityType: "Issue",
        entityId: item.id,
        params: {
          title: item.title,
          severity: item.severity,
          isBlocker: item.isBlocker,
        },
      },
    });

    return item;
  });

  return issue;
}

export async function resolveIssue(
  actor: User,
  issueId: string,
  resolution: string
): Promise<Issue> {
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) throw AppError.notFound("Issue not found");

  return prisma.issue.update({
    where: { id: issueId },
    data: {
      status: IssueStatus.RESOLVED,
      resolution: resolution.trim(),
      resolvedAt: new Date(),
    },
  });
}

