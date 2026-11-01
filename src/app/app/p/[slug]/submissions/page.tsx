import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectBySlug } from "@/server/services/projects";
import { prisma } from "@/server/db/prisma";
import { SubmissionsView } from "@/components/submissions/submissions-view";

export default async function SubmissionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const { project, membership } = await getProjectBySlug(slug, user);

  const [submissions, docs] = await Promise.all([
    prisma.submission.findMany({
      where: { projectId: project.id },
      orderBy: { deadline: "asc" },
      include: {
        frozenBy: { select: { name: true } },
        requirements: {
          orderBy: { order: "asc" },
          include: {
            completedBy: { select: { name: true } },
            documentVersion: {
              select: {
                id: true,
                versionNumber: true,
                originalName: true,
                checksumSha256: true,
              },
            },
          },
        },
        snapshots: {
          orderBy: { sequence: "desc" },
          include: {
            createdBy: { select: { name: true } },
            artifacts: true,
          },
        },
        events: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            actor: { select: { name: true } },
          },
        },
      },
    }),
    prisma.document.findMany({
      where: { projectId: project.id, archivedAt: null },
      select: {
        id: true,
        title: true,
        currentVersionId: true,
      },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--border)] pb-3">
        <h1 className="text-xl font-bold text-[var(--ink)]">
          التسليمات النهائية (Submissions)
        </h1>
        <p className="text-xs text-[var(--ink-secondary)]">
          تجهيز متطلبات التسليم، إرفاق الملفات النهائية، واعتماد حزمة التسليم
        </p>
      </div>

      <SubmissionsView
        projectId={project.id}
        projectSlug={project.slug}
        initialSubmissions={submissions as any}
        availableDocs={docs}
        userRole={membership?.role || user.systemRole}
      />
    </div>
  );
}

