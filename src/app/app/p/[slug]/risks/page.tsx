import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectBySlug } from "@/server/services/projects";
import { prisma } from "@/server/db/prisma";
import { RisksView } from "@/components/risks/risks-view";

export default async function RisksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const { project } = await getProjectBySlug(slug, user);

  const [risks, issues] = await Promise.all([
    prisma.risk.findMany({
      where: { projectId: project.id },
      orderBy: [{ probability: "desc" }, { impact: "desc" }, { createdAt: "desc" }],
      include: {
        owner: { select: { name: true } },
      },
    }),
    prisma.issue.findMany({
      where: { projectId: project.id },
      orderBy: [{ isBlocker: "desc" }, { createdAt: "desc" }],
      include: {
        owner: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--border)] pb-3">
        <h1 className="text-xl font-bold text-[var(--ink)]">
          المخاطر والمشكلات (Risks & Issues)
        </h1>
        <p className="text-xs text-[var(--ink-secondary)]">
          تقييم المخاطر المحتملة وخطط التعامل معها، ومتابعة المشكلات الحالية
        </p>
      </div>

      <RisksView
        projectId={project.id}
        projectSlug={project.slug}
        initialRisks={risks as any}
        initialIssues={issues as any}
      />
    </div>
  );
}

