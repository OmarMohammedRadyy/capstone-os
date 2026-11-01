import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectBySlug } from "@/server/services/projects";
import { calculateProjectHealth } from "@/server/services/health";
import { prisma } from "@/server/db/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HealthRing } from "@/components/ui/health-ring";
import { PageHeader } from "@/components/ui/page-header";
import { RecomputeHealthButton } from "@/components/dashboard/recompute-health-button";
import { formatDate } from "@/lib/utils";
import {
  CheckSquare,
  Flag,
  MessageSquareWarning,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Clock,
  Activity,
  Compass,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const { project, membership } = await getProjectBySlug(slug, user);

  const [
    health,
    activePhase,
    nextMilestone,
    activeSprint,
    openFeedback,
    upcomingMeetings,
    myTasks,
    highRisks,
    recentActivities,
  ] = await Promise.all([
    calculateProjectHealth(project.id),
    prisma.phase.findFirst({
      where: { projectId: project.id, status: "IN_PROGRESS" },
      orderBy: { order: "asc" },
    }),
    prisma.milestone.findFirst({
      where: { projectId: project.id, status: { not: "COMPLETED" } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.sprint.findFirst({
      where: { projectId: project.id, status: "ACTIVE" },
    }),
    prisma.feedback.findMany({
      where: { projectId: project.id, status: { not: "VERIFIED" } },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { author: { select: { name: true } } },
    }),
    prisma.meeting.findMany({
      where: { projectId: project.id, status: "SCHEDULED" },
      orderBy: { scheduledAt: "asc" },
      take: 3,
    }),
    prisma.task.findMany({
      where: {
        projectId: project.id,
        status: { not: "DONE" },
        assignees: { some: { userId: user.id } },
      },
      orderBy: { dueAt: "asc" },
      take: 5,
    }),
    prisma.risk.findMany({
      where: { projectId: project.id, status: { not: "CLOSED" } },
      orderBy: [{ probability: "desc" }, { impact: "desc" }],
      take: 3,
    }),
    prisma.activityEvent.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { actor: { select: { name: true } } },
    }),
  ]);

  const now = new Date();
  const daysToNextMilestone = nextMilestone
    ? Math.ceil(
        (new Date(nextMilestone.dueDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const recommendedActions = [
    {
      textAr: "مراجعة ومعالجة ملاحظات المشرف المفتوحة",
      href: "/feedback",
    },
    {
      textAr: "تحديث حالة المهام الجارية في السبرنت الحالي",
      href: "/tasks",
    },
    {
      textAr: "رفع ملفات التسليم المرحلي القادم وطلب الاعتماد",
      href: "/roadmap",
    },
    {
      textAr: "استكمال متطلبات التسليم النهائي وخطة المناقشة",
      href: "/submissions",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Unified Executive Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: project.code, href: `/app/p/${project.slug}/overview` },
          { label: "لوحة المتابعة (Overview)" },
        ]}
        title={project.title}
        description={`${project.department} • العام الأكاديمي ${project.academicYear}`}
        badge={
          <Badge variant="gold" size="sm">
            {membership?.role || user.systemRole}
          </Badge>
        }
        actions={
          <>
            <RecomputeHealthButton projectId={project.id} />
            <Link href={`/app/p/${project.slug}/tasks`}>
              <Button variant="primary" size="sm">
                إدارة المهام
              </Button>
            </Link>
          </>
        }
      />

      {/* 1. 4-Card Summary Strip */}
      <div
        data-guide="overview-pulse-strip"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
      >
        <Card className="p-4 flex items-center justify-between gap-3 overflow-hidden border-[var(--border)] bg-[var(--surface)]">
          <div className="text-start min-w-0 flex-1">
            <span className="text-[11px] font-medium text-[var(--ink-secondary)] block truncate">
              المرحلة الحالية
            </span>
            <span
              className="text-sm font-bold text-[var(--ink)] mt-0.5 block truncate"
              title={activePhase ? activePhase.name : "التنفيذ والتطوير"}
            >
              {activePhase ? activePhase.name : "التنفيذ والتطوير"}
            </span>
            <span className="text-[10px] text-[var(--accent)] font-semibold mt-1 block truncate">
              مرحلة قيد التنفيذ
            </span>
          </div>
          <div className="h-9 w-9 rounded-[var(--radius-sm)] bg-[var(--primary-subtle)] text-[var(--accent)] flex items-center justify-center shrink-0">
            <Compass className="h-4 w-4" />
          </div>
        </Card>

        <Card
          data-guide="overview-next-milestone"
          className="p-4 flex items-center justify-between gap-3 overflow-hidden border-[var(--border)] bg-[var(--surface)]"
        >
          <div className="text-start min-w-0 flex-1">
            <span className="text-[11px] font-medium text-[var(--ink-secondary)] block truncate">
              التسليم المرحلي القادم (Milestone)
            </span>
            <span
              className="text-sm font-bold text-[var(--ink)] mt-0.5 block truncate"
              title={nextMilestone ? nextMilestone.title : "جميع المراحل مكتملة"}
            >
              {nextMilestone ? nextMilestone.title : "جميع المراحل مكتملة"}
            </span>
            <span className="text-[10px] font-mono font-semibold text-[var(--gold-text)] mt-1 block truncate">
              {daysToNextMilestone !== null
                ? daysToNextMilestone >= 0
                  ? `متبقي ${daysToNextMilestone} يوم (${formatDate(nextMilestone!.dueDate, "ar")})`
                  : `متأخر بـ ${Math.abs(daysToNextMilestone)} يوم`
                : "مكتمل"}
            </span>
          </div>
          <div className="h-9 w-9 rounded-[var(--radius-sm)] bg-[var(--gold-subtle)] text-[var(--gold-text)] flex items-center justify-center shrink-0">
            <Flag className="h-4 w-4" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between gap-3 overflow-hidden border-[var(--border)] bg-[var(--surface)]">
          <div className="text-start min-w-0 flex-1">
            <span className="text-[11px] font-medium text-[var(--ink-secondary)] block truncate">
              ملاحظات المشرف المفتوحة
            </span>
            <span className="text-xl font-bold text-[var(--ink)] num-tabular mt-0.5 block">
              {openFeedback.length}
            </span>
            <span className="text-[10px] text-[var(--ink-muted)] mt-0.5 block truncate">
              {openFeedback.some((f) => f.severity === "BLOCKING")
                ? "تتضمن ملاحظة عاجلة"
                : openFeedback.length > 0
                ? "بانتظار المعالجة والاعتماد"
                : "لا توجد ملاحظات معلقة"}
            </span>
          </div>
          <div className="h-9 w-9 rounded-[var(--radius-sm)] bg-[var(--warning-subtle)] text-[var(--warning)] flex items-center justify-center shrink-0">
            <MessageSquareWarning className="h-4 w-4" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between gap-3 overflow-hidden border-[var(--border)] bg-[var(--surface)]">
          <div className="text-start min-w-0 flex-1">
            <span className="text-[11px] font-medium text-[var(--ink-secondary)] block truncate">
              السبرنت الحالي (Active Sprint)
            </span>
            <span
              className="text-sm font-bold text-[var(--ink)] mt-0.5 block truncate"
              title={activeSprint ? activeSprint.name : "قائمة المهام العامة"}
            >
              {activeSprint ? activeSprint.name : "قائمة المهام العامة"}
            </span>
            <span className="text-[10px] text-[var(--accent)] font-semibold mt-1 block truncate">
              {myTasks.length > 0
                ? `${myTasks.length} مهام نشطة مسندة إليك`
                : "لا توجد مهام معلقة باسمك"}
            </span>
          </div>
          <div className="h-9 w-9 rounded-[var(--radius-sm)] bg-[var(--primary-subtle)] text-[var(--accent)] flex items-center justify-center shrink-0">
            <CheckSquare className="h-4 w-4" />
          </div>
        </Card>
      </div>

      {/* 2. Project Health + Priority Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card
          data-guide="overview-health-engine"
          className="lg:col-span-8 flex flex-col justify-between"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="text-start">
              <CardTitle className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                <span>مؤشر أداء المشروع (Project Health)</span>
              </CardTitle>
              <p className="text-[11px] text-[var(--ink-secondary)] mt-0.5">
                متابعة الالتزام بالجدول الزمني، إنجاز المهام، ملاحظات المشرف، المخاطر، وتوزيع العمل
              </p>
            </div>
            <Badge
              variant={
                health.score >= 70
                  ? "success"
                  : health.score >= 55
                  ? "warning"
                  : "danger"
              }
              dot
            >
              {health.status} ({health.score}/100)
            </Badge>
          </CardHeader>

          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-[var(--radius-md)] bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
              <HealthRing score={health.score} status={health.status} size={112} strokeWidth={9} />
              <span className="text-xs font-bold text-[var(--ink)] mt-2">
                التقييم العام للمشروع
              </span>
              <span className="text-[10px] text-[var(--ink-secondary)]">
                اكتمال البيانات: {health.confidence}%
              </span>
            </div>

            <div className="md:col-span-8 space-y-2.5 text-xs">
              {[
                { label: "الالتزام بالجدول الزمني (Schedule)", val: health.components.schedule },
                { label: "إنجاز المهام (Tasks)", val: health.components.tasks },
                { label: "معالجة ملاحظات المشرف (Feedback)", val: health.components.feedback },
                { label: "إدارة المخاطر والمشكلات (Risks)", val: health.components.risks },
                { label: "اكتمال ملفات التسليم (Readiness)", val: health.components.readiness },
                { label: "توازن توزيع العمل (Workload)", val: health.components.workload },
              ].map((dim) => (
                <div key={dim.label} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[var(--ink-secondary)] font-medium">{dim.label}</span>
                    <span className="font-bold text-[var(--ink)] num-tabular">{dim.val}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--surface-subtle)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${dim.val}%`,
                        backgroundColor:
                          dim.val >= 75
                            ? "var(--accent)"
                            : dim.val >= 55
                            ? "var(--gold)"
                            : "var(--danger)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>

          {/* Summary Drivers */}
          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 gap-3 text-start text-xs">
            <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--primary-subtle)]/60 border border-[var(--accent)]/15">
              <div className="font-bold text-[var(--accent)] flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>نقاط القوة الحالية:</span>
              </div>
              <ul className="space-y-1 text-[11px] text-[var(--ink-secondary)]">
                <li>• انتظام تحديث المهام والالتزام بخطة المراحل</li>
                <li>• توثيق القرارات التقنية وحفظ إصدارات الملفات</li>
              </ul>
            </div>

            <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--warning-subtle)]/60 border border-[var(--warning)]/20">
              <div className="font-bold text-[var(--warning)] flex items-center gap-1.5 mb-1">
                <TrendingDown className="h-3.5 w-3.5" />
                <span>نقاط تحتاج إلى متابعة ({health.drivers.length}):</span>
              </div>
              <ul className="space-y-1 text-[11px] text-[var(--ink-secondary)]">
                {health.drivers.length > 0 ? (
                  health.drivers.slice(0, 2).map((d, i) => (
                    <li key={i}>• {d.message}</li>
                  ))
                ) : (
                  <li>• لا توجد مشكلات حرجة مؤثرة على التقدم حاليًا.</li>
                )}
              </ul>
            </div>
          </div>
        </Card>

        {/* Priority Next Actions & Recommendations */}
        <Card
          data-guide="overview-priority-actions"
          className="lg:col-span-4 flex flex-col justify-between"
        >
          <div>
            <CardHeader className="pb-3 border-b border-[var(--border-subtle)] text-start">
              <CardTitle className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--gold)]" />
                <span>أولويات العمل الحالية</span>
              </CardTitle>
              <p className="text-[11px] text-[var(--ink-secondary)]">
                إجراءات مقترحة لتحسين تقدم المشروع
              </p>
            </CardHeader>

            <CardContent className="pt-3 space-y-2.5 text-start">
              {recommendedActions.map((rec, idx) => (
                <Link
                  key={idx}
                  href={`/app/p/${project.slug}${rec.href}`}
                  className="block p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-subtle)]/50 hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--ink)] leading-snug">
                      {rec.textAr}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-[var(--accent)] rtl:rotate-180 shrink-0 mt-0.5" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </div>

          {/* Upcoming Meetings Mini-List */}
          <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] text-start">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[var(--ink)] flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[var(--copper)]" />
                <span>الاجتماعات القادمة ({upcomingMeetings.length})</span>
              </span>
              <Link
                href={`/app/p/${project.slug}/meetings`}
                className="text-[11px] font-semibold text-[var(--accent)] hover:underline"
              >
                الكل ←
              </Link>
            </div>
            {upcomingMeetings.length === 0 ? (
              <p className="text-[11px] text-[var(--ink-muted)]">لا توجد اجتماعات مجدولة.</p>
            ) : (
              <div className="space-y-1.5">
                {upcomingMeetings.slice(0, 2).map((m) => (
                  <div
                    key={m.id}
                    className="p-2 rounded-[var(--radius-sm)] bg-[var(--surface-subtle)] text-[11px] flex items-center justify-between"
                  >
                    <span className="font-semibold text-[var(--ink)] truncate max-w-[160px]">
                      {m.title}
                    </span>
                    <span className="text-[var(--ink-secondary)] font-mono">
                      {formatDate(m.scheduledAt, "ar")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 3. Lower Grid: My Work Today + Supervisor Feedback & Risks + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Col 1: My Active Tasks */}
        <Card data-guide="overview-my-work" className="space-y-3 text-start">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-[var(--accent)]" />
              <span>مهامي الجارية ({myTasks.length})</span>
            </h3>
            <Link
              href={`/app/p/${project.slug}/my-work`}
              className="text-xs text-[var(--accent)] hover:underline font-semibold"
            >
              عرض مهامي ←
            </Link>
          </div>

          <div className="space-y-2">
            {myTasks.map((t) => (
              <Link
                key={t.id}
                href={`/app/p/${project.slug}/tasks`}
                className="p-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-subtle)]/50 hover:border-[var(--accent)] transition-colors flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[var(--ink-secondary)]">
                      #{t.number}
                    </span>
                    <span className="font-semibold text-[var(--ink)] truncate">
                      {t.title}
                    </span>
                  </div>
                  {t.dueAt && (
                    <div className="text-[11px] text-[var(--ink-muted)] flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(t.dueAt, "ar")}</span>
                    </div>
                  )}
                </div>
                <Badge
                  variant={
                    t.status === "BLOCKED"
                      ? "danger"
                      : t.priority === "CRITICAL"
                      ? "warning"
                      : "default"
                  }
                  size="sm"
                >
                  {t.status}
                </Badge>
              </Link>
            ))}

            {myTasks.length === 0 && (
              <p className="text-xs text-[var(--ink-secondary)] py-6 text-center">
                لا توجد مهام معلقة مسندة إليك حاليًا.
              </p>
            )}
          </div>
        </Card>

        {/* Col 2: Supervisor Feedback & Active Risks */}
        <Card className="space-y-3 text-start">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
              <MessageSquareWarning className="h-4 w-4 text-[var(--gold)]" />
              <span>ملاحظات المشرف والمخاطر</span>
            </h3>
            <Link
              href={`/app/p/${project.slug}/feedback`}
              className="text-xs text-[var(--accent)] hover:underline font-semibold"
            >
              صندوق الملاحظات ←
            </Link>
          </div>

          <div className="space-y-2">
            {openFeedback.slice(0, 3).map((fb) => (
              <Link
                key={fb.id}
                href={`/app/p/${project.slug}/feedback`}
                className="block p-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-subtle)]/50 hover:border-[var(--accent)] transition-colors text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <Badge
                    variant={fb.severity === "BLOCKING" ? "danger" : "warning"}
                    size="sm"
                  >
                    {fb.severity}
                  </Badge>
                  <span className="text-[11px] text-[var(--ink-muted)]">
                    {fb.author.name}
                  </span>
                </div>
                <p className="font-semibold text-[var(--ink)] line-clamp-1">
                  {fb.title}
                </p>
              </Link>
            ))}

            {highRisks.slice(0, 2).map((r) => (
              <Link
                key={r.id}
                href={`/app/p/${project.slug}/risks`}
                className="block p-2.5 rounded-[var(--radius-sm)] border border-[var(--copper)]/30 bg-[var(--copper-subtle)]/50 text-xs"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-[var(--copper-text)] flex items-center gap-1 text-[11px]">
                    <AlertTriangle className="h-3 w-3" />
                    خطر ({r.probability * r.impact}/25)
                  </span>
                  <span className="text-[10px] text-[var(--ink-secondary)]">
                    {r.category}
                  </span>
                </div>
                <p className="font-semibold text-[var(--ink)] truncate">{r.title}</p>
              </Link>
            ))}
          </div>
        </Card>

        {/* Col 3: Recent Activity Timeline */}
        <Card className="space-y-3 text-start">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
            <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--accent)]" />
              <span>آخر التحديثات</span>
            </h3>
            <Link
              href={`/app/p/${project.slug}/activity`}
              className="text-xs text-[var(--accent)] hover:underline font-semibold"
            >
              سجل النشاط ←
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="border-s-2 border-[var(--accent)]/40 ps-3 py-0.5 text-xs space-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--ink)]">{act.actor?.name || "النظام"}</span>
                  <span className="text-[10px] font-mono text-[var(--ink-muted)]">
                    {formatDate(act.createdAt, "ar")}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--ink-secondary)] truncate">
                  {act.type} • {act.entityType}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
