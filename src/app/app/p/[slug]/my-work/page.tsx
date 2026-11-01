import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectBySlug } from "@/server/services/projects";
import { prisma } from "@/server/db/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";
import {
  AlertOctagon,
  Clock,
  MessageSquareWarning,
  Calendar,
  ArrowRight,
  Briefcase,
} from "lucide-react";

export default async function MyWorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const { project } = await getProjectBySlug(slug, user);

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [myTasks, myFeedback, myActionItems] = await Promise.all([
    prisma.task.findMany({
      where: {
        projectId: project.id,
        status: { not: "DONE" },
        assignees: { some: { userId: user.id } },
      },
      include: {
        sprint: true,
        milestone: true,
        checklist: true,
      },
      orderBy: [{ priority: "asc" }, { dueAt: "asc" }],
    }),
    prisma.feedback.findMany({
      where: {
        projectId: project.id,
        status: { not: "VERIFIED" },
        OR: [{ assigneeId: user.id }, { assigneeId: null }],
      },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    }),
    prisma.meetingAction.findMany({
      where: {
        meeting: { projectId: project.id },
        ownerId: user.id,
        status: { not: "DONE" },
      },
      include: { meeting: true },
    }),
  ]);

  const overdueTasks = myTasks.filter((t) => t.dueAt && t.dueAt < now);
  const blockedTasks = myTasks.filter((t) => t.status === "BLOCKED");
  const dueSoonTasks = myTasks.filter(
    (t) => t.dueAt && t.dueAt >= now && t.dueAt <= nextWeek
  );

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: project.code, href: `/app/p/${project.slug}/overview` },
          { label: "مهامي (My Work)" },
        ]}
        title="مهامي والتكليفات اليومية (My Work)"
        description={`مرحبًا ${user.name} — متابعة المهام، التكليفات، وملاحظات المشرف المسندة إليك`}
        actions={
          <Link href={`/app/p/${project.slug}/tasks`}>
            <Button variant="primary" size="sm">
              لوحة المهام الكاملة
            </Button>
          </Link>
        }
      />

      {/* Quick KPI Strip */}
      <div
        data-guide="mywork-kpi-strip"
        className="grid grid-cols-2 md:grid-cols-4 gap-3.5"
      >
        <Card className="p-4 text-start">
          <div className="text-xs text-[var(--ink-secondary)]">إجمالي مهامي النشطة</div>
          <div className="text-2xl font-bold text-[var(--ink)] mt-1 num-tabular">
            {myTasks.length}
          </div>
        </Card>

        <Card className="p-4 text-start border-[var(--danger)]/30">
          <div className="text-xs text-[var(--danger)] flex items-center gap-1 font-medium">
            <AlertOctagon className="h-3.5 w-3.5" />
            <span>مهام متأخرة أو معطلة</span>
          </div>
          <div className="text-2xl font-bold text-[var(--danger)] mt-1 num-tabular">
            {overdueTasks.length + blockedTasks.length}
          </div>
        </Card>

        <Card className="p-4 text-start">
          <div className="text-xs text-[var(--warning)] flex items-center gap-1 font-medium">
            <Clock className="h-3.5 w-3.5" />
            <span>تستحق خلال 7 أيام</span>
          </div>
          <div className="text-2xl font-bold text-[var(--ink)] mt-1 num-tabular">
            {dueSoonTasks.length}
          </div>
        </Card>

        <Card className="p-4 text-start">
          <div className="text-xs text-[var(--accent)] flex items-center gap-1 font-medium">
            <MessageSquareWarning className="h-3.5 w-3.5" />
            <span>ملاحظات مشرف بانتظار الحل</span>
          </div>
          <div className="text-2xl font-bold text-[var(--ink)] mt-1 num-tabular">
            {myFeedback.length}
          </div>
        </Card>
      </div>

      {/* Main Execution Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Assigned Tasks */}
        <div data-guide="mywork-tasks-list" className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[var(--accent)]" />
              <span>قائمة المهام المسندة إليك ({myTasks.length})</span>
            </h2>
            <Link
              href={`/app/p/${project.slug}/tasks`}
              className="text-xs text-[var(--accent)] hover:underline font-semibold flex items-center gap-1"
            >
              <span>الذهاب للوحة المهام</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {myTasks.map((task) => {
              const isOverdue = task.dueAt && task.dueAt < now;
              const doneChecklist = task.checklist.filter((c) => c.done).length;

              return (
                <Card
                  key={task.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start hover:border-[var(--accent)] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[var(--ink-secondary)]">
                        #{task.number}
                      </span>
                      <Badge
                        variant={
                          task.status === "BLOCKED"
                            ? "danger"
                            : task.status === "IN_PROGRESS"
                            ? "accent"
                            : "default"
                        }
                        size="sm"
                      >
                        {task.status}
                      </Badge>
                      <Badge
                        variant={
                          task.priority === "CRITICAL"
                            ? "danger"
                            : task.priority === "HIGH"
                            ? "gold"
                            : "default"
                        }
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                      {task.sprint && (
                        <span className="text-[11px] text-[var(--ink-muted)]">
                          • {task.sprint.name}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-[var(--ink)]">
                      {task.title}
                    </h3>

                    {task.status === "BLOCKED" && task.blockedReason && (
                      <p className="text-xs text-[var(--danger)] bg-[var(--danger-subtle)] px-2 py-1 rounded">
                        سبب التعطيل: {task.blockedReason}
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-end justify-between gap-2 shrink-0 text-xs">
                    {task.dueAt && (
                      <span
                        className={
                          isOverdue
                            ? "text-[var(--danger)] font-bold"
                            : "text-[var(--ink-secondary)]"
                        }
                      >
                        استحقاق: {formatDate(task.dueAt, "ar")}
                      </span>
                    )}
                    {task.checklist.length > 0 && (
                      <span className="text-[11px] text-[var(--ink-muted)] font-mono">
                        قائمة الفحص: {doneChecklist}/{task.checklist.length}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}

            {myTasks.length === 0 && (
              <Card subtle className="p-8 text-center text-xs text-[var(--ink-secondary)]">
                أنجزت جميع المهام المسندة إليك!
              </Card>
            )}
          </div>
        </div>

        {/* Column 3: Supervisor Feedback & Meeting Action Items */}
        <div data-guide="mywork-feedback-side" className="space-y-6 text-start">
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
              <MessageSquareWarning className="h-4 w-4 text-[var(--gold)]" />
              <span>ملاحظات المشرف المفتوحة ({myFeedback.length})</span>
            </h2>

            <div className="space-y-2.5">
              {myFeedback.map((fb) => (
                <Card key={fb.id} className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={fb.severity === "BLOCKING" ? "danger" : "warning"}
                      size="sm"
                    >
                      {fb.severity}
                    </Badge>
                    <span className="text-[11px] text-[var(--ink-muted)]">
                      {fb.category}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[var(--ink)]">{fb.title}</p>
                  <p className="text-xs text-[var(--ink-secondary)] line-clamp-2">
                    {fb.body}
                  </p>
                  <div className="pt-1 flex justify-end">
                    <Link
                      href={`/app/p/${project.slug}/feedback`}
                      className="text-[11px] text-[var(--accent)] font-semibold hover:underline"
                    >
                      حل الملاحظة وتقديم الدليل ←
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[var(--copper)]" />
              <span>تكليفات الاجتماعات ({myActionItems.length})</span>
            </h2>

            <div className="space-y-2">
              {myActionItems.map((item) => (
                <Card key={item.id} className="p-3 text-xs space-y-1">
                  <p className="font-semibold text-[var(--ink)]">{item.text}</p>
                  <div className="flex items-center justify-between text-[11px] text-[var(--ink-muted)]">
                    <span>من: {item.meeting.title}</span>
                    {item.dueDate && <span>{formatDate(item.dueDate, "ar")}</span>}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
