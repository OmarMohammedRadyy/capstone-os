import { prisma } from "@/server/db/prisma";
import {
  MilestoneStatus,
  TaskStatus,
  FeedbackStatus,
  FeedbackSeverity,
  RiskStatus,
  IssueStatus,
  SubmissionStatus,
} from "@/generated/prisma";
import type { HealthSnapshot } from "@/generated/prisma";

export interface HealthDriver {
  type: "warning" | "danger" | "info";
  category: "schedule" | "tasks" | "feedback" | "risks" | "readiness" | "workload";
  message: string;
  impact: number;
  entityIds?: string[];
}

export interface HealthCalculationResult {
  score: number;
  status: "EXCELLENT" | "ON_TRACK" | "NEEDS_ATTENTION" | "AT_RISK" | "CRITICAL";
  confidence: number;
  components: {
    schedule: number;
    tasks: number;
    feedback: number;
    risks: number;
    readiness: number;
    workload: number;
  };
  weights: {
    schedule: number;
    tasks: number;
    feedback: number;
    risks: number;
    readiness: number;
    workload: number;
  };
  drivers: HealthDriver[];
  calculatedAt: string;
}

export async function calculateProjectHealth(
  projectId: string,
  trigger: string = "manual"
): Promise<HealthCalculationResult> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { where: { active: true } },
      milestones: true,
      tasks: {
        include: { assignees: true },
      },
      feedback: true,
      risks: { where: { status: { in: [RiskStatus.OPEN, RiskStatus.MITIGATING] } } },
      issues: { where: { status: { in: [IssueStatus.OPEN, IssueStatus.INVESTIGATING, IssueStatus.FIXING] } } },
      submissions: {
        include: { requirements: true },
        orderBy: { deadline: "asc" },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const now = new Date();
  const drivers: HealthDriver[] = [];

  // 1. Schedule & Milestones (Weight: project.weightSchedule)
  let scheduleScore = 100;
  const overdueMilestones = project.milestones.filter(
    (m) => m.dueDate < now && m.status !== MilestoneStatus.COMPLETED
  );
  if (overdueMilestones.length > 0) {
    const penalty = Math.min(60, overdueMilestones.length * 20);
    scheduleScore -= penalty;
    drivers.push({
      type: "danger",
      category: "schedule",
      message: `${overdueMilestones.length} milestone(s) are overdue`,
      impact: penalty,
      entityIds: overdueMilestones.map((m) => m.id),
    });
  }

  const blockedMilestones = project.milestones.filter((m) => m.status === MilestoneStatus.BLOCKED);
  if (blockedMilestones.length > 0) {
    const penalty = Math.min(30, blockedMilestones.length * 15);
    scheduleScore -= penalty;
    drivers.push({
      type: "warning",
      category: "schedule",
      message: `${blockedMilestones.length} milestone(s) are currently marked as blocked`,
      impact: penalty,
      entityIds: blockedMilestones.map((m) => m.id),
    });
  }
  scheduleScore = Math.max(0, scheduleScore);

  // 2. Task Execution (Weight: project.weightTasks)
  let tasksScore = 100;
  const openTasks = project.tasks.filter((t) => t.status !== TaskStatus.DONE && t.status !== TaskStatus.CANCELLED);
  const overdueTasks = openTasks.filter((t) => t.dueAt && t.dueAt < now);
  if (overdueTasks.length > 0) {
    const penalty = Math.min(40, overdueTasks.length * 8);
    tasksScore -= penalty;
    drivers.push({
      type: "danger",
      category: "tasks",
      message: `${overdueTasks.length} task(s) are past their due date`,
      impact: penalty,
      entityIds: overdueTasks.map((t) => t.id),
    });
  }

  const blockedTasks = openTasks.filter((t) => t.status === TaskStatus.BLOCKED);
  if (blockedTasks.length > 0) {
    const penalty = Math.min(40, blockedTasks.length * 10);
    tasksScore -= penalty;
    drivers.push({
      type: "warning",
      category: "tasks",
      message: `${blockedTasks.length} task(s) are blocked by dependencies or impediments`,
      impact: penalty,
      entityIds: blockedTasks.map((t) => t.id),
    });
  }
  tasksScore = Math.max(0, tasksScore);

  // 3. Supervisor Feedback (Weight: project.weightFeedback)
  let feedbackScore = 100;
  const openFeedback = project.feedback.filter(
    (f) => f.status === FeedbackStatus.OPEN || f.status === FeedbackStatus.IN_PROGRESS
  );
  const blockingFeedback = openFeedback.filter((f) => f.severity === FeedbackSeverity.BLOCKING);
  if (blockingFeedback.length > 0) {
    const penalty = Math.min(60, blockingFeedback.length * 25);
    feedbackScore -= penalty;
    drivers.push({
      type: "danger",
      category: "feedback",
      message: `${blockingFeedback.length} blocking supervisor feedback comment(s) unresolved`,
      impact: penalty,
      entityIds: blockingFeedback.map((f) => f.id),
    });
  }

  const importantFeedback = openFeedback.filter((f) => f.severity === FeedbackSeverity.IMPORTANT);
  if (importantFeedback.length > 0) {
    const penalty = Math.min(30, importantFeedback.length * 10);
    feedbackScore -= penalty;
    drivers.push({
      type: "warning",
      category: "feedback",
      message: `${importantFeedback.length} important supervisor feedback item(s) pending resolution`,
      impact: penalty,
      entityIds: importantFeedback.map((f) => f.id),
    });
  }
  feedbackScore = Math.max(0, feedbackScore);

  // 4. Risks & Issues (Weight: project.weightRisk)
  let risksScore = 100;
  const criticalRisks = project.risks.filter((r) => r.probability * r.impact >= 16);
  if (criticalRisks.length > 0) {
    const penalty = Math.min(40, criticalRisks.length * 15);
    risksScore -= penalty;
    drivers.push({
      type: "danger",
      category: "risks",
      message: `${criticalRisks.length} critical risk(s) with high exposure score (≥16)`,
      impact: penalty,
      entityIds: criticalRisks.map((r) => r.id),
    });
  }

  const blockingIssues = project.issues.filter((i) => i.isBlocker);
  if (blockingIssues.length > 0) {
    const penalty = Math.min(50, blockingIssues.length * 20);
    risksScore -= penalty;
    drivers.push({
      type: "danger",
      category: "risks",
      message: `${blockingIssues.length} active critical blocker issue(s) open`,
      impact: penalty,
      entityIds: blockingIssues.map((i) => i.id),
    });
  }
  risksScore = Math.max(0, risksScore);

  // 5. Readiness Score (Weight: project.weightReadiness)
  let readinessScore = 100;
  const nextSubmission = project.submissions.find(
    (s) => s.status !== SubmissionStatus.ACCEPTED && s.status !== SubmissionStatus.SUBMITTED
  );
  if (nextSubmission && nextSubmission.requirements.length > 0) {
    const total = nextSubmission.requirements.length;
    const completed = nextSubmission.requirements.filter((r) => r.completed).length;
    readinessScore = Math.round((completed / total) * 100);

    if (readinessScore < 70 && nextSubmission.deadline.getTime() - now.getTime() < 14 * 24 * 60 * 60 * 1000) {
      drivers.push({
        type: "warning",
        category: "readiness",
        message: `Submission "${nextSubmission.title}" is due soon with only ${readinessScore}% requirements ready`,
        impact: 100 - readinessScore,
        entityIds: [nextSubmission.id],
      });
    }
  }

  // 6. Workload Balance (Weight: project.weightWorkload)
  let workloadScore = 100;
  const studentMembers = project.members.filter((m) => m.role === "STUDENT" || m.role === "TEAM_LEADER");
  if (studentMembers.length > 1 && openTasks.length > 5) {
    // Check distribution of open tasks
    const counts = studentMembers.map((m) => {
      const assigned = openTasks.filter((t) => t.assignees.some((a) => a.userId === m.userId)).length;
      return { userId: m.userId, count: assigned };
    });
    const maxCount = Math.max(...counts.map((c) => c.count));
    const ratio = maxCount / openTasks.length;
    if (ratio > 0.65) {
      workloadScore = 60;
      drivers.push({
        type: "warning",
        category: "workload",
        message: "Workload concentration alert: over 65% of open tasks are assigned to a single member",
        impact: 40,
      });
    }
  }

  // Weighted composite sum
  const composite =
    scheduleScore * (project.weightSchedule / 100) +
    tasksScore * (project.weightTasks / 100) +
    feedbackScore * (project.weightFeedback / 100) +
    risksScore * (project.weightRisk / 100) +
    readinessScore * (project.weightReadiness / 100) +
    workloadScore * (project.weightWorkload / 100);

  const finalScore = Math.round(Math.max(0, Math.min(100, composite)));

  let status: HealthCalculationResult["status"] = "ON_TRACK";
  if (finalScore >= 90) status = "EXCELLENT";
  else if (finalScore >= 75) status = "ON_TRACK";
  else if (finalScore >= 60) status = "NEEDS_ATTENTION";
  else if (finalScore >= 40) status = "AT_RISK";
  else status = "CRITICAL";

  // Confidence metric: based on having milestones and tasks
  const hasData = project.milestones.length > 0 && project.tasks.length > 0;
  const confidence = hasData ? 95 : 60;

  // Save immutable snapshot to DB
  await prisma.healthSnapshot.create({
    data: {
      projectId,
      score: finalScore,
      status,
      confidence,
      scheduleScore,
      tasksScore,
      feedbackScore,
      riskScore: risksScore,
      readinessScore,
      workloadScore,
      drivers: drivers as unknown as object,
      trigger,
    },
  });

  return {
    score: finalScore,
    status,
    confidence,
    components: {
      schedule: scheduleScore,
      tasks: tasksScore,
      feedback: feedbackScore,
      risks: risksScore,
      readiness: readinessScore,
      workload: workloadScore,
    },
    weights: {
      schedule: project.weightSchedule,
      tasks: project.weightTasks,
      feedback: project.weightFeedback,
      risks: project.weightRisk,
      readiness: project.weightReadiness,
      workload: project.weightWorkload,
    },
    drivers,
    calculatedAt: new Date().toISOString(),
  };
}

export async function getLatestProjectHealth(
  projectId: string
): Promise<HealthCalculationResult | null> {
  const latest = await prisma.healthSnapshot.findFirst({
    where: { projectId },
    orderBy: { calculatedAt: "desc" },
  });

  if (!latest) {
    return calculateProjectHealth(projectId, "initial");
  }

  // If latest snapshot is older than 6 hours, recompute
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  if (latest.calculatedAt < sixHoursAgo) {
    return calculateProjectHealth(projectId, "scheduled_refresh");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      weightSchedule: true,
      weightTasks: true,
      weightFeedback: true,
      weightRisk: true,
      weightReadiness: true,
      weightWorkload: true,
    },
  });

  return {
    score: latest.score,
    status: latest.status as HealthCalculationResult["status"],
    confidence: latest.confidence,
    components: {
      schedule: latest.scheduleScore ?? 100,
      tasks: latest.tasksScore ?? 100,
      feedback: latest.feedbackScore ?? 100,
      risks: latest.riskScore ?? 100,
      readiness: latest.readinessScore ?? 100,
      workload: latest.workloadScore ?? 100,
    },
    weights: {
      schedule: project?.weightSchedule ?? 30,
      tasks: project?.weightTasks ?? 20,
      feedback: project?.weightFeedback ?? 15,
      risks: project?.weightRisk ?? 15,
      readiness: project?.weightReadiness ?? 10,
      workload: project?.weightWorkload ?? 10,
    },
    drivers: (latest.drivers as unknown as HealthDriver[]) || [],
    calculatedAt: latest.calculatedAt.toISOString(),
  };
}

