import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectBySlug } from "@/server/services/projects";
import { prisma } from "@/server/db/prisma";
import { MeetingsView } from "@/components/meetings/meetings-view";

export default async function MeetingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const { project } = await getProjectBySlug(slug, user);

  const [meetings, members] = await Promise.all([
    prisma.meeting.findMany({
      where: { projectId: project.id },
      orderBy: { scheduledAt: "desc" },
      include: {
        actions: {
          include: {
            task: { select: { id: true, number: true } },
            owner: { select: { name: true } },
          },
        },
        attendees: {
          include: { user: { select: { name: true } } },
        },
      },
    }),
    prisma.projectMember.findMany({
      where: { projectId: project.id, active: true },
      include: { user: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--border)] pb-3">
        <h1 className="text-xl font-bold text-[var(--ink)]">
          الاجتماعات والمحاضر (Meetings)
        </h1>
        <p className="text-xs text-[var(--ink-secondary)]">
          جدولة الاجتماعات، تسجيل المحاضر، وتحويل النقاط المتفق عليها إلى مهام
        </p>
      </div>

      <MeetingsView
        projectId={project.id}
        projectSlug={project.slug}
        initialMeetings={meetings as any}
        members={members}
      />
    </div>
  );
}

