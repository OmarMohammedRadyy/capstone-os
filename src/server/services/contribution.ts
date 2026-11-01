import { prisma } from "@/server/db/prisma";
import { TaskStatus, FeedbackStatus, ActionItemStatus } from "@/generated/prisma";

export interface MemberContributionMetrics {
  userId: string;
  name: string;
  email: string;
  responsibilityTitle: string | null;
  tasksCompleted: number;
  pointsCompleted: number;
  documentsAuthored: number;
  decisionsAuthored: number;
  feedbackResolved: number;
  actionsCompleted: number;
  milestonesOwned: number;
  totalContributionScore: number;
}

export interface ContributionAnalyticsResult {
  members: MemberContributionMetrics[];
  busFactorWarnings: Array<{ area: string; contributorName: string }>;
  upcomingWorkload: Array<{
    userId: string;
    name: string;
    dueSoonTaskCount: number;
  }>;
}

export async function calculateProjectContribution(
  projectId: string
): Promise<ContributionAnalyticsResult> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { active: true },
        include: { user: true },
      },
      tasks: {
        include: { assignees: true, labels: { include: { label: true } } },
      },
      documents: {
        include: { versions: true },
      },
      decisions: true,
      feedback: true,
      meetings: {
        include: { actions: true },
      },
      milestones: true,
    },
  });

  if (!project) throw new Error("Project not found");

  const completedTasks = project.tasks.filter((t) => t.status === TaskStatus.DONE);
  const now = new Date();
  const next14Days = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const membersMetrics: MemberContributionMetrics[] = project.members.map((m) => {
    const userCompletedTasks = completedTasks.filter((t) =>
      t.assignees.some((a) => a.userId === m.userId)
    );
    const points = userCompletedTasks.reduce((acc, t) => acc + (t.estimatePoints || 1), 0);

    const docVersions = project.documents
      .flatMap((d) => d.versions)
      .filter((v) => v.uploadedById === m.userId).length;

    const decisions = project.decisions.filter((d) => d.ownerId === m.userId).length;

    const feedbackResolved = project.feedback.filter(
      (f) => f.assigneeId === m.userId && (f.status === FeedbackStatus.RESOLVED || f.status === FeedbackStatus.VERIFIED)
    ).length;

    const actions = project.meetings
      .flatMap((meet) => meet.actions)
      .filter((a) => a.ownerId === m.userId && a.status === ActionItemStatus.DONE).length;

    const milestones = project.milestones.filter((ms) => ms.ownerId === m.userId).length;

    // Explainable composite score based on verified artifacts
    const totalScore =
      userCompletedTasks.length * 5 +
      points * 2 +
      docVersions * 4 +
      decisions * 3 +
      feedbackResolved * 3 +
      actions * 2 +
      milestones * 5;

    return {
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      responsibilityTitle: m.responsibilityTitle,
      tasksCompleted: userCompletedTasks.length,
      pointsCompleted: points,
      documentsAuthored: docVersions,
      decisionsAuthored: decisions,
      feedbackResolved,
      actionsCompleted: actions,
      milestonesOwned: milestones,
      totalContributionScore: totalScore,
    };
  });

  // Bus factor warnings: identify areas where only 1 person has completed work
  const busFactorWarnings: Array<{ area: string; contributorName: string }> = [];
  const labelGroups = new Map<string, Set<string>>();

  for (const t of completedTasks) {
    for (const tl of t.labels) {
      if (!labelGroups.has(tl.label.name)) {
        labelGroups.set(tl.label.name, new Set());
      }
      for (const a of t.assignees) {
        labelGroups.get(tl.label.name)?.add(a.userId);
      }
    }
  }

  for (const [labelName, userIds] of labelGroups.entries()) {
    if (userIds.size === 1) {
      const soleUserId = Array.from(userIds)[0]!;
      const member = project.members.find((m) => m.userId === soleUserId);
      if (member) {
        busFactorWarnings.push({
          area: labelName,
          contributorName: member.user.name,
        });
      }
    }
  }

  // Upcoming 14-day workload concentration
  const openTasks = project.tasks.filter((t) => t.status !== TaskStatus.DONE && t.status !== TaskStatus.CANCELLED);
  const dueSoonTasks = openTasks.filter((t) => t.dueAt && t.dueAt >= now && t.dueAt <= next14Days);

  const upcomingWorkload = project.members.map((m) => {
    const count = dueSoonTasks.filter((t) => t.assignees.some((a) => a.userId === m.userId)).length;
    return {
      userId: m.userId,
      name: m.user.name,
      dueSoonTaskCount: count,
    };
  });

  return {
    members: membersMetrics,
    busFactorWarnings,
    upcomingWorkload,
  };
}

