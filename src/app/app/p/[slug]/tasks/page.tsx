import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectBySlug } from "@/server/services/projects";
import { prisma } from "@/server/db/prisma";
import { TaskBoard } from "@/components/tasks/task-board";

export default async function TasksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const { project } = await getProjectBySlug(slug, user);

  const [tasks, members, sprints, milestones] = await Promise.all([
    prisma.task.findMany({
      where: { projectId: project.id },
      orderBy: { number: "asc" },
      include: {
        assignees: { include: { user: { select: { id: true, name: true } } } },
        checklist: { orderBy: { order: "asc" } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { name: true } } },
        },
        labels: { include: { label: true } },
        blockedBy: {
          include: { dependsOn: { select: { id: true, number: true, title: true } } },
        },
      },
    }),
    prisma.projectMember.findMany({
      where: { projectId: project.id, active: true },
      include: { user: { select: { name: true } } },
    }),
    prisma.sprint.findMany({
      where: { projectId: project.id, status: { in: ["PLANNED", "ACTIVE"] } },
      select: { id: true, name: true },
    }),
    prisma.milestone.findMany({
      where: { projectId: project.id },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--border)] pb-3">
        <h1 className="text-xl font-bold text-[var(--ink)]">
          إدارة المهام (Tasks)
        </h1>
        <p className="text-xs text-[var(--ink-secondary)]">
          متابعة المهام وتوزيعها حسب الحالة والأولوية وأعضاء الفريق
        </p>
      </div>

      <TaskBoard
        initialTasks={tasks as any}
        projectId={project.id}
        projectSlug={project.slug}
        members={members}
        sprints={sprints}
        milestones={milestones}
      />
    </div>
  );
}

