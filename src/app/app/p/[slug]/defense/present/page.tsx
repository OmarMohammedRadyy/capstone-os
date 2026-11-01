import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectBySlug } from "@/server/services/projects";
import { prisma } from "@/server/db/prisma";
import { getOrCreateDefensePlan } from "@/server/services/defense";
import { calculateProjectHealth } from "@/server/services/health";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HealthRing } from "@/components/ui/health-ring";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ArrowLeft, Clock, MapPin, Award, Users, CheckCircle2, ShieldCheck } from "lucide-react";

export default async function DefensePresentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const { project } = await getProjectBySlug(slug, user);

  const [planRaw, health, members, deliverables] = await Promise.all([
    getOrCreateDefensePlan(project.id),
    calculateProjectHealth(project.id),
    prisma.projectMember.findMany({
      where: { projectId: project.id, active: true },
      include: { user: true },
    }),
    prisma.submission.findMany({
      where: { projectId: project.id },
      include: { snapshots: true },
    }),
  ]);

  const plan = await prisma.defensePlan.findUniqueOrThrow({
    where: { id: planRaw.id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: { owner: { select: { name: true } } },
      },
    },
  });

  const supervisor = members.find((m) => m.role === "SUPERVISOR");
  const students = members.filter((m) => m.role !== "SUPERVISOR");
  const totalDuration = plan.sections.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="min-h-screen bg-[var(--surface-canvas)] text-[var(--ink)] p-8 lg:p-12 flex flex-col justify-between">
      {/* Top Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showText />
            <Link href={`/app/p/${project.slug}/defense`}>
              <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                العودة لغرفة العمليات
              </Button>
            </Link>
            <Badge variant="outline" className="text-xs font-mono">
              DEFENSE PRESENTATION MODE
            </Badge>
          </div>

          <div className="flex items-center gap-6 text-xs text-[var(--ink-secondary)]">
            {plan.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[var(--ink)]" />
                {plan.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[var(--ink)]" />
              المدة الإجمالية: {totalDuration} دقيقة
            </span>
          </div>
        </div>

        {/* Project Title & Academic Meta */}
        <div className="py-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-3">
            <Badge variant="default" className="text-xs">
              {project.academicYear} • مشروع التخرج الأكاديمي
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--ink)]">
              {project.title}
            </h1>
            <p className="text-base text-[var(--ink-secondary)] max-w-3xl leading-relaxed">
              {project.abstract || "منظومة متكاملة لخدمة متطلبات التخرج وتطبيق أفضل المعايير الهندسية."}
            </p>
          </div>

          {/* Project Health Score Ring */}
          <div className="flex items-center justify-center lg:justify-end gap-6 bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)]">
            <HealthRing score={health.score} status={health.status} size={90} strokeWidth={8} />
            <div>
              <p className="text-xs text-[var(--ink-secondary)]">مؤشر الصحة الأكاديمية</p>
              <p className="text-xl font-bold text-[var(--ink)]">
                {health.status} ({health.score}/100)
              </p>
              <p className="text-[11px] text-[var(--ink-tertiary)] mt-0.5">
                محسوب استنادًا إلى 6 أبعاد هندسية
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Grid: Agenda & Team Responsibilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
        {/* Presentation Flow & Speaker Agenda */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600" />
              جدول محاور العرض والتوقيت الزمني (Agenda)
            </h2>
            <Badge variant="outline" className="text-xs">
              {plan.sections.length} محاور
            </Badge>
          </div>

          <div className="space-y-3">
            {plan.sections.map((section, idx) => (
              <div
                key={section.id}
                className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--surface)] text-[var(--ink)] font-bold flex items-center justify-center text-xs border border-[var(--border)]">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--ink)]">{section.title}</h3>
                    {section.notes && (
                      <p className="text-xs text-[var(--ink-secondary)] mt-0.5">{section.notes}</p>
                    )}
                  </div>
                </div>

                <div className="text-end">
                  <span className="text-xs font-semibold text-[var(--ink)] block">
                    {section.owner?.name || "الفريق"}
                  </span>
                  <Badge variant="default" className="text-[10px] mt-0.5">
                    {section.durationMinutes} دقائق
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members & Academic Supervisor */}
        <div className="space-y-6">
          {/* Supervisor Card */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 block">
                المشرف الأكاديمي (Academic Supervisor)
              </span>
              <p className="text-base font-bold text-[var(--ink)] mt-0.5">
                {supervisor ? supervisor.user.name : "د. محمد فاروق"}
              </p>
              <p className="text-xs text-[var(--ink-secondary)]">قسم هندسة البرمجيات ونظم المعلومات</p>
            </div>
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
          </div>

          {/* Students Team Members */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                فريق عمل المشروع ومسؤوليات الإنجاز
              </h2>
              <Badge variant="outline" className="text-xs">
                {students.length} مهندسين
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--ink)]">{student.user.name}</span>
                    <Badge variant="default" className="text-[10px]">
                      {student.role}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[var(--ink-secondary)]">
                    {student.responsibilityTitle || "هندسة النظام والتنفيذ"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Signature */}
      <div className="pt-6 border-t border-[var(--border)] flex flex-wrap items-center justify-between text-xs text-[var(--ink-secondary)]">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-[var(--ink)]" />
          <span>تم توليد لوحة المناقشة والتحقق الرقمي عبر SVA-DUATE Enterprise</span>
        </div>
        <div className="font-mono text-[11px]">
          PROJECT REF: {project.id.slice(0, 8)} • READY FOR JURY EVALUATION
        </div>
      </div>
    </div>
  );
}
