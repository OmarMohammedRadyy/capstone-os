import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectBySlug } from "@/server/services/projects";
import { prisma } from "@/server/db/prisma";
import { DecisionsView } from "@/components/decisions/decisions-view";

export default async function DecisionsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const { project } = await getProjectBySlug(slug, user);

  const decisions = await prisma.decision.findMany({
    where: { projectId: project.id },
    orderBy: { number: "asc" },
    include: {
      owner: { select: { name: true } },
      options: { orderBy: { order: "asc" } },
      revisions: {
        orderBy: { revision: "desc" },
        include: { editor: { select: { name: true } } },
      },
      supersededBy: { select: { id: true, number: true, title: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--border)] pb-3">
        <h1 className="text-xl font-bold text-[var(--ink)]">
          القرارات التقنية والمعمارية (Technical Decisions)
        </h1>
        <p className="text-xs text-[var(--ink-secondary)]">
          توثيق القرارات الهندسية والتقنية المهمة في المشروع وأسباب اختيارها
        </p>
      </div>

      <DecisionsView
        projectId={project.id}
        projectSlug={project.slug}
        initialDecisions={decisions as any}
      />
    </div>
  );
}

