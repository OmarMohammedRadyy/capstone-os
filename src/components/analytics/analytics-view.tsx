"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ContributionAnalyticsResult } from "@/server/services/contribution";
import {
  Users,
  Award,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileText,
  GitCommit,
  MessageSquare,
  ShieldAlert,
  Info,
} from "lucide-react";

export function AnalyticsView({
  analytics,
}: {
  analytics: ContributionAnalyticsResult;
}) {
  const totalScoreAllMembers = analytics.members.reduce(
    (acc, m) => acc + m.totalContributionScore,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Philosophy note */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-[var(--ink-secondary)] mt-0.5 shrink-0" />
        <div className="text-xs text-[var(--ink-secondary)] space-y-1">
          <p className="font-semibold text-[var(--ink)]">
            آلية حساب مساهمة أعضاء الفريق
          </p>
          <p>
            تُحسب مساهمة كل عضو بناءً على المهام المنجزة، الملفات المرفوعة، القرارات التقنية المسجلة، ومعالجة ملاحظات المشرف.
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div
        data-guide="analytics-kpi-strip"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--ink-secondary)]">إجمالي نقاط الإنجاز</p>
              <p className="text-2xl font-bold text-[var(--ink)]">{totalScoreAllMembers}</p>
              <p className="text-[11px] text-[var(--ink-tertiary)] mt-0.5">مجموع نقاط المهام والمخرجات</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--surface-muted)] flex items-center justify-center text-[var(--ink)]">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--ink-secondary)]">أعضاء الفريق</p>
              <p className="text-2xl font-bold text-[var(--ink)]">{analytics.members.length}</p>
              <p className="text-[11px] text-[var(--ink-tertiary)] mt-0.5">أعضاء نشطون في المشروع</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--surface-muted)] flex items-center justify-center text-[var(--ink)]">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--ink-secondary)]">توزيع التخصصات</p>
              <p className={`text-2xl font-bold ${analytics.busFactorWarnings.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {analytics.busFactorWarnings.length}
              </p>
              <p className="text-[11px] text-[var(--ink-tertiary)] mt-0.5">
                {analytics.busFactorWarnings.length > 0 ? "جوانب يعمل عليها عضو واحد" : "توزيع متوازن للمهام"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--surface-muted)] flex items-center justify-center text-[var(--ink)]">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--ink-secondary)]">مهام الأسبوعين القادمين</p>
              <p className="text-2xl font-bold text-[var(--ink)]">
                {analytics.upcomingWorkload.reduce((acc, w) => acc + w.dueSoonTaskCount, 0)}
              </p>
              <p className="text-[11px] text-[var(--ink-tertiary)] mt-0.5">مهام قريبة الاستحقاق</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--surface-muted)] flex items-center justify-center text-[var(--ink)]">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bus Factor Warnings Section */}
      {analytics.busFactorWarnings.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              تنبيه تركز المهام في عضو واحد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[var(--ink-secondary)] mb-3">
              الجوانب التالية يعمل عليها عضو واحد فقط، ويُنصح بمشاركة عضو آخر لضمان استمرارية العمل:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {analytics.busFactorWarnings.map((w, idx) => (
                <div
                  key={idx}
                  className="rounded border border-amber-500/20 bg-[var(--surface)] p-2.5 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-[var(--ink)]">{w.area}</span>
                  <Badge variant="outline" className="text-[11px] border-amber-500/40 text-amber-700 dark:text-amber-300">
                    الوحيد: {w.contributorName}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Contribution Relative Distribution Bar */}
      <Card data-guide="analytics-bus-factor">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-[var(--ink)]">
            نسبة المساهمة الإجمالية للفريق
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full h-4 rounded-full overflow-hidden flex bg-[var(--surface-muted)]">
            {analytics.members.map((m, idx) => {
              const pct = totalScoreAllMembers > 0 ? (m.totalContributionScore / totalScoreAllMembers) * 100 : 0;
              const colors = [
                "bg-[#163A24] dark:bg-[#34A866]",
                "bg-[#C89B2C] dark:bg-[#DFB244]",
                "bg-[#B4653A] dark:bg-[#D48256]",
                "bg-[#276741] dark:bg-[#52BF80]",
                "bg-[#8A6514] dark:bg-[#F0CA67]",
                "bg-[#4A544E] dark:bg-[#9BA8A0]",
              ];
              const colorClass = colors[idx % colors.length];
              return (
                <div
                  key={m.userId}
                  style={{ width: `${pct}%` }}
                  className={`${colorClass} transition-all duration-300 relative group cursor-pointer`}
                  title={`${m.name}: ${pct.toFixed(1)}%`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            {analytics.members.map((m, idx) => {
              const pct = totalScoreAllMembers > 0 ? (m.totalContributionScore / totalScoreAllMembers) * 100 : 0;
              const colors = [
                "bg-[#163A24] dark:bg-[#34A866]",
                "bg-[#C89B2C] dark:bg-[#DFB244]",
                "bg-[#B4653A] dark:bg-[#D48256]",
                "bg-[#276741] dark:bg-[#52BF80]",
                "bg-[#8A6514] dark:bg-[#F0CA67]",
                "bg-[#4A544E] dark:bg-[#9BA8A0]",
              ];
              return (
                <div key={m.userId} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${colors[idx % colors.length]}`} />
                  <span className="font-medium text-[var(--ink)]">{m.name}</span>
                  <span className="text-[var(--ink-secondary)]">({pct.toFixed(1)}%)</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Member Cards Detailed Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[var(--ink)]">
          تفاصيل مساهمة الأعضاء والنتائج المعتمدة
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.members.map((member) => {
            const memberScorePct =
              totalScoreAllMembers > 0
                ? ((member.totalContributionScore / totalScoreAllMembers) * 100).toFixed(1)
                : "0";
            const workload =
              analytics.upcomingWorkload.find((w) => w.userId === member.userId)?.dueSoonTaskCount || 0;

            return (
              <Card key={member.userId} className="relative overflow-hidden">
                <CardHeader className="pb-3 border-b border-[var(--border)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} className="h-10 w-10 text-sm font-semibold" />
                      <div>
                        <h3 className="text-sm font-bold text-[var(--ink)]">{member.name}</h3>
                        <p className="text-xs text-[var(--ink-secondary)]">
                          {member.responsibilityTitle || "عضو الفريق"} • {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-base font-bold text-[var(--ink)]">
                        {member.totalContributionScore}{" "}
                        <span className="text-xs font-normal text-[var(--ink-secondary)]">نقطة</span>
                      </div>
                      <Badge variant="secondary" className="text-[11px] mt-0.5">
                        {memberScorePct}% من إجمالي المشروع
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* Verified deliverables breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-2">
                      <div className="flex items-center justify-center gap-1 text-[var(--ink-secondary)] text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>المهام المنجزة</span>
                      </div>
                      <p className="text-sm font-bold text-[var(--ink)] mt-1">
                        {member.tasksCompleted}{" "}
                        <span className="text-[10px] text-[var(--ink-secondary)]">
                          ({member.pointsCompleted} نقطة)
                        </span>
                      </p>
                    </div>

                    <div className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-2">
                      <div className="flex items-center justify-center gap-1 text-[var(--ink-secondary)] text-[11px]">
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                        <span>إصدارات الوثائق</span>
                      </div>
                      <p className="text-sm font-bold text-[var(--ink)] mt-1">
                        {member.documentsAuthored}
                      </p>
                    </div>

                    <div className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-2">
                      <div className="flex items-center justify-center gap-1 text-[var(--ink-secondary)] text-[11px]">
                        <GitCommit className="h-3.5 w-3.5 text-indigo-600" />
                        <span>القرارات (ADRs)</span>
                      </div>
                      <p className="text-sm font-bold text-[var(--ink)] mt-1">
                        {member.decisionsAuthored}
                      </p>
                    </div>

                    <div className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-2">
                      <div className="flex items-center justify-center gap-1 text-[var(--ink-secondary)] text-[11px]">
                        <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
                        <span>ملاحظات تمت معالجتها</span>
                      </div>
                      <p className="text-sm font-bold text-[var(--ink)] mt-1">
                        {member.feedbackResolved}
                      </p>
                    </div>

                    <div className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-2">
                      <div className="flex items-center justify-center gap-1 text-[var(--ink-secondary)] text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                        <span>مخرجات الاجتماعات</span>
                      </div>
                      <p className="text-sm font-bold text-[var(--ink)] mt-1">
                        {member.actionsCompleted}
                      </p>
                    </div>

                    <div className="rounded border border-[var(--border)] bg-[var(--surface-muted)] p-2">
                      <div className="flex items-center justify-center gap-1 text-[var(--ink-secondary)] text-[11px]">
                        <Award className="h-3.5 w-3.5 text-purple-600" />
                        <span>المحطات المملوكة</span>
                      </div>
                      <p className="text-sm font-bold text-[var(--ink)] mt-1">
                        {member.milestonesOwned}
                      </p>
                    </div>
                  </div>

                  {/* Upcoming 14-day workload banner */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)]">
                    <span className="text-[var(--ink-secondary)]">مهام الـ 14 يومًا القادمة:</span>
                    <Badge variant={workload > 3 ? "destructive" : "outline"} className="text-xs">
                      {workload} مهام قيد التنفيذ
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

