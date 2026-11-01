import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectBySlug } from "@/server/services/projects";
import { prisma } from "@/server/db/prisma";
import { getOrCreateDefensePlan, calculateDefenseReadiness } from "@/server/services/defense";
import { DefenseView } from "@/components/defense/defense-view";

export default async function DefensePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const { project } = await getProjectBySlug(slug, user);

  const [planRaw, readinessPct, members] = await Promise.all([
    getOrCreateDefensePlan(project.id),
    calculateDefenseReadiness(project.id),
    prisma.projectMember.findMany({
      where: { projectId: project.id, active: true },
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);

  const plan = await prisma.defensePlan.findUniqueOrThrow({
    where: { id: planRaw.id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: { owner: { select: { name: true } } },
      },
      checklist: { orderBy: { order: "asc" } },
      questions: {
        orderBy: { order: "asc" },
        include: { owner: { select: { name: true } } },
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--border)] pb-3">
        <h1 className="text-xl font-bold text-[var(--ink)]">
          التحضير للمناقشة النهائية (Defense Preparation)
        </h1>
        <p className="text-xs text-[var(--ink-secondary)]">
          تنظيم فقرات العرض التقديمي، توزيع الوقت بين المتحدثين، وبنك الأسئلة المتوقعة
        </p>
      </div>

      <DefenseView
        projectId={project.id}
        projectSlug={project.slug}
        plan={plan as any}
        teamMembers={members.map((m) => ({ userId: m.userId, name: m.user.name }))}
        readinessPct={readinessPct}
      />
    </div>
  );
}

