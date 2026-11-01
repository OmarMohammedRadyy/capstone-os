import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectBySlug } from "@/server/services/projects";
import { prisma } from "@/server/db/prisma";
import { ActivityTimelineView } from "@/components/activity/activity-timeline-view";

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const { project } = await getProjectBySlug(slug, user);

  const [activities, members] = await Promise.all([
    prisma.activityEvent.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.projectMember.findMany({
      where: { projectId: project.id, active: true },
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--border)] pb-3">
        <h1 className="text-xl font-bold text-[var(--ink)]">
          سجل النشاط (Activity Log)
        </h1>
        <p className="text-xs text-[var(--ink-secondary)]">
          سجل زمني لجميع التحديثات والإجراءات التي تمت في المشروع
        </p>
      </div>

      <ActivityTimelineView
        activities={activities as any}
        teamMembers={members.map((m) => ({ id: m.user.id, name: m.user.name }))}
      />
    </div>
  );
}

