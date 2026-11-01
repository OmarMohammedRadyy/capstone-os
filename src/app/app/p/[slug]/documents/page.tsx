import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectBySlug } from "@/server/services/projects";
import { prisma } from "@/server/db/prisma";
import { DocumentsView } from "@/components/documents/documents-view";

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const { project } = await getProjectBySlug(slug, user);

  const docs = await prisma.document.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { name: true } },
      versions: {
        orderBy: { versionNumber: "desc" },
        include: { uploadedBy: { select: { name: true } } },
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--border)] pb-3">
        <h1 className="text-xl font-bold text-[var(--ink)]">
          المستندات والملفات (Documents)
        </h1>
        <p className="text-xs text-[var(--ink-secondary)]">
          إدارة ملفات المشروع، التقارير، والعروض التقديمية مع حفظ سجل الإصدارات
        </p>
      </div>

      <DocumentsView
        projectId={project.id}
        projectSlug={project.slug}
        initialDocuments={docs as any}
      />
    </div>
  );
}

