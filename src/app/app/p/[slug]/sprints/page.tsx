import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectBySlug } from "@/server/services/projects";
import { prisma } from "@/server/db/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Zap, CheckCircle2, AlertOctagon, Calendar, ArrowRight } from "lucide-react";

export default async function SprintsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const { project } = await getProjectBySlug(slug, user);

  const [activeSprint, closedSprints, plannedSprints] = await Promise.all([
    prisma.sprint.findFirst({
      where: { projectId: project.id, status: "ACTIVE" },
      include: {
        tasks: {
          include: { assignees: { include: { user: { select: { name: true } } } } },
        },
      },
    }),
    prisma.sprint.findMany({
      where: { projectId: project.id, status: "CLOSED" },
      orderBy: { closedAt: "desc" },
    }),
    prisma.sprint.findMany({
      where: { projectId: project.id, status: "PLANNED" },
      orderBy: { startDate: "asc" },
      include: { tasks: true },
    }),
  ]);

  const activeTasks = activeSprint?.tasks || [];
  const completedCount = activeTasks.filter((t) => t.status === "DONE").length;
  const totalCount = activeTasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="border-b border-[var(--border)] pb-3">
        <h1 className="text-xl font-bold text-[var(--ink)]">
          السبرنتات ودورات العمل (Sprints)
        </h1>
        <p className="text-xs text-[var(--ink-secondary)]">
          تنظيم المهام في دورات زمنية محددة ومتابعة نسبة الإنجاز
        </p>
      </div>

      {/* Active Sprint Section */}
      {activeSprint ? (
        <Card
          data-guide="sprints-active-card"
          className="border-[var(--accent)]/40 bg-[var(--surface)] shadow-sm"
        >
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="accent" dot size="sm">
                  الدورة الحالية النشطة
                </Badge>
                <span className="text-xs text-[var(--ink-secondary)]">
                  {formatDate(activeSprint.startDate, "ar")} – {formatDate(activeSprint.endDate, "ar")}
                </span>
              </div>
              <CardTitle className="text-lg font-bold text-[var(--ink)]">
                {activeSprint.name}
              </CardTitle>
              {activeSprint.goal && (
                <p className="text-xs text-[var(--ink-secondary)] mt-1">
                  الهدف الأكاديمي: {activeSprint.goal}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={completionRate >= 80 ? "success" : "default"} size="lg">
                نسبة الإنجاز {completionRate}%
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-[var(--radius-sm)] bg-[var(--surface-subtle)] text-xs text-start">
              <div>
                <span className="text-[11px] text-[var(--ink-secondary)] block">السعة المخططة</span>
                <span className="font-bold text-sm text-[var(--ink)]">{activeSprint.plannedCapacity || "—"} pts</span>
              </div>
              <div>
                <span className="text-[11px] text-[var(--ink-secondary)] block">المهام المنجزة</span>
                <span className="font-bold text-sm text-[var(--success)]">{completedCount} / {totalCount}</span>
              </div>
              <div>
                <span className="text-[11px] text-[var(--ink-secondary)] block">النقاط الأساسية</span>
                <span className="font-bold text-sm text-[var(--ink)]">{activeSprint.baselinePoints || 0} pts</span>
              </div>
              <div>
                <span className="text-[11px] text-[var(--ink-secondary)] block">المهام المعطلة</span>
                <span className="font-bold text-sm text-[var(--danger)]">
                  {activeTasks.filter((t) => t.status === "BLOCKED").length}
                </span>
              </div>
            </div>

            {/* Task list in active sprint */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[var(--ink)]">مهام هذه الدورة ({activeTasks.length}):</h3>
              {activeTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded border border-[var(--border-subtle)] bg-[var(--surface)] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--ink-secondary)]">#{t.number}</span>
                    <span className="font-semibold text-[var(--ink)]">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="accent" size="sm">{t.status}</Badge>
                    <span className="text-[11px] text-[var(--ink-muted)] font-medium">
                      {t.estimatePoints || 0} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-8 text-center bg-[var(--surface-subtle)]">
          <Zap className="h-8 w-8 text-[var(--ink-muted)] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[var(--ink)] mb-1">لا توجد دورة نشطة حاليًا</h3>
          <p className="text-xs text-[var(--ink-secondary)] mb-4">
            قم ببدء دورة عمل جديدة وتحديد الأهداف الأكاديمية ونقاط السعة.
          </p>
        </Card>
      )}

      {/* Closed Sprints History */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-[var(--ink)]">الدورات السابقة المكتملة ({closedSprints.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {closedSprints.map((cs) => (
            <Card key={cs.id} className="p-4 space-y-2 text-start">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[var(--ink)]">{cs.name}</h4>
                <Badge variant="success" size="sm">مكتملة</Badge>
              </div>
              <p className="text-xs text-[var(--ink-secondary)]">
                المنجز: {cs.completedPoints || 0} نقطة ({cs.completedTaskCount || 0} مهمة)
              </p>
              {cs.retrospective && (
                <p className="text-[11px] text-[var(--ink-secondary)] bg-[var(--surface-subtle)] p-2 rounded italic">
                  &ldquo;{cs.retrospective}&rdquo;
                </p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

