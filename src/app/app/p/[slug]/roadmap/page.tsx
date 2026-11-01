import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectBySlug } from "@/server/services/projects";
import { prisma } from "@/server/db/prisma";
import { RoadmapView } from "@/components/roadmap/roadmap-view";

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const { project, membership } = await getProjectBySlug(slug, user);

  const [phases, milestones] = await Promise.all([
    prisma.phase.findMany({
      where: { projectId: project.id },
      orderBy: { order: "asc" },
      include: { milestones: true },
    }),
    prisma.milestone.findMany({
      where: { projectId: project.id },
      orderBy: { order: "asc" },
      include: {
        owner: { select: { id: true, name: true } },
        evidence: true,
        approvals: { include: { actor: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
        tasks: { select: { id: true, status: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border)] pb-3">
        <h1 className="text-xl font-bold text-[var(--ink)]">
          خطة المشروع والتسليمات المرحلية (Project Plan & Milestones)
        </h1>
        <p className="text-xs text-[var(--ink-secondary)]">
          مراحل المشروع، مواعيد التسليم الفرعية، واعتمادات المشرف الأكاديمي
        </p>
      </div>

      <RoadmapView
        projectSlug={project.slug}
        userRole={membership?.role || "STUDENT"}
        phases={phases as any}
        milestones={milestones as any}
      />
    </div>
  );
}

