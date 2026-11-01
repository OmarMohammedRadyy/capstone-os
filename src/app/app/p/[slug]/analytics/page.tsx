import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectBySlug } from "@/server/services/projects";
import { calculateProjectContribution } from "@/server/services/contribution";
import { AnalyticsView } from "@/components/analytics/analytics-view";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const { project } = await getProjectBySlug(slug, user);

  const analytics = await calculateProjectContribution(project.id);

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--border)] pb-3">
        <h1 className="text-xl font-bold text-[var(--ink)]">
          تقارير الأداء والمساهمة (Team Analytics)
        </h1>
        <p className="text-xs text-[var(--ink-secondary)]">
          إحصائيات إنجاز المهام، المساهمة في الملفات، وتوزيع العمل بين أعضاء الفريق
        </p>
      </div>

      <AnalyticsView analytics={analytics} />
    </div>
  );
}

