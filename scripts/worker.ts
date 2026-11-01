import "dotenv/config";
import { prisma } from "../src/server/db/prisma";
import { calculateProjectHealth } from "../src/server/services/health";
import { createNotification } from "../src/server/services/notifications";
import { NotificationCategory, ProjectStatus, TaskStatus } from "../src/generated/prisma";
import { logger } from "../src/server/lib/logger";

async function runHealthCron() {
  logger.info("Running daily health recomputation job...");
  const activeProjects = await prisma.project.findMany({
    where: {
      status: {
        in: [ProjectStatus.PLANNING, ProjectStatus.ACTIVE, ProjectStatus.AT_RISK],
      },
    },
    select: { id: true, title: true },
  });

  for (const project of activeProjects) {
    try {
      const health = await calculateProjectHealth(project.id, "CRON");
      logger.info(
        `[Cron] Updated health for project "${project.title}": ${health.score}/100 (${health.status})`
      );
    } catch (err) {
      logger.error(`[Cron] Failed to recompute health for project ${project.id}:`, err);
    }
  }
}

async function runDeadlineAlertsCron() {
  logger.info("Running deadline proximity reminder job...");
  const now = new Date();
  const next48h = new Date(Date.now() + 48 * 60 * 60 * 1000);

  // Find tasks due within 48 hours that are not completed
  const dueSoonTasks = await prisma.task.findMany({
    where: {
      status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
      dueAt: { gte: now, lte: next48h },
    },
    include: {
      assignees: true,
      project: { select: { id: true, slug: true, title: true } },
    },
  });

  for (const task of dueSoonTasks) {
    for (const assignee of task.assignees) {
      try {
        await createNotification({
          userId: assignee.userId,
          projectId: task.projectId,
          category: NotificationCategory.DEADLINE,
          type: "TASK_DUE_SOON",
          params: {
            title: task.title,
            dueAt: task.dueAt?.toISOString(),
            projectTitle: task.project.title,
          },
          href: `/app/p/${task.project.slug}/tasks`,
        });
      } catch (err) {
        logger.error(`Failed to dispatch due soon notification for task ${task.id}:`, err);
      }
    }
  }
}

async function runSessionCleanupCron() {
  logger.info("Running expired session purge job...");
  const purged = await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  logger.info(`[Cron] Purged ${purged.count} expired sessions.`);
}

async function main() {
  logger.info("Starting Capstone OS Background Worker daemon...");

  const runAll = async () => {
    try {
      await runHealthCron();
      await runDeadlineAlertsCron();
      await runSessionCleanupCron();
    } catch (err: any) {
      console.error("Error executing background worker cycle:", err);
    }
  };

  await runAll();

  if (process.argv.includes("--once")) {
    logger.info("Single execution completed (--once). Exiting.");
    process.exit(0);
  }

  // Interval execution every 15 minutes
  setInterval(runAll, 15 * 60 * 1000);
}

main().catch((err) => {
  logger.error("Fatal background worker error:", err);
  process.exit(1);
});
