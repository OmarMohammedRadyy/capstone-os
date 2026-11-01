import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectBySlug } from "@/server/services/projects";
import { prisma } from "@/server/db/prisma";
import { FeedbackInbox } from "@/components/feedback/feedback-inbox";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const { project, membership } = await getProjectBySlug(slug, user);

  const [feedback, members] = await Promise.all([
    prisma.feedback.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        assignee: { select: { name: true } },
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
          ملاحظات المشرف (Supervisor Feedback)
        </h1>
        <p className="text-xs text-[var(--ink-secondary)]">
          متابعة ملاحظات المشرف الأكاديمي، حالة المعالجة، والاعتماد
        </p>
      </div>

      <FeedbackInbox
        projectId={project.id}
        projectSlug={project.slug}
        userRole={membership?.role || "STUDENT"}
        initialFeedback={feedback as any}
        members={members}
      />
    </div>
  );
}

