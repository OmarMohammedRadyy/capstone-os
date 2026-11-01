"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/context";
import { useUserGuide } from "../engine/guide-context";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  ChevronUp,
  ChevronDown,
  X,
  Compass,
  Play,
} from "lucide-react";

export function OnboardingChecklist() {
  const { locale } = useTranslation();
  const router = useRouter();
  const {
    isHydrated,
    state,
    metrics,
    projectSlug,
    activeGuide,
    startGuide,
    toggleChecklistMinimized,
    dismissChecklist,
    openGuideCenter,
  } = useUserGuide();

  if (!isHydrated || state.checklistDismissed || activeGuide) {
    return null;
  }

  const isAr = locale === "ar";
  const baseUrl = `/app/p/${projectSlug}`;

  // Dynamic checklist items computed directly from live PostgreSQL metrics + user guide state
  const items = [
    {
      id: "chk-workspace",
      labelAr: "افتح مساحة عمل مشروع التخرج",
      labelEn: "Open graduation project workspace",
      done: true,
      href: `${baseUrl}/overview`,
      guideId: "dashboard-command",
    },
    {
      id: "chk-team",
      labelAr: `كوّن فريق المشروع (${metrics.teamCount} أعضاء حاليًا)`,
      labelEn: `Assemble project team (${metrics.teamCount} members)`,
      done: metrics.teamCount > 1,
      href: `${baseUrl}/settings`,
      guideId: "dashboard-command",
    },
    {
      id: "chk-milestone",
      labelAr: `حدّد المحطات الرئيسية (${metrics.milestonesCount} Milestones)`,
      labelEn: `Define project milestones (${metrics.milestonesCount})`,
      done: metrics.milestonesCount > 0,
      href: `${baseUrl}/roadmap`,
      guideId: "roadmap-milestones",
    },
    {
      id: "chk-task",
      labelAr: `أضف وتابع مهام التنفيذ (${metrics.tasksCount} Tasks)`,
      labelEn: `Create & track tasks (${metrics.tasksCount})`,
      done: metrics.tasksCount > 0,
      href: `${baseUrl}/tasks`,
      guideId: "tasks-workflow",
    },
    {
      id: "chk-meeting",
      labelAr: `سجّل اجتماع وحوّل تكليفاته (${metrics.meetingsCount} الاجتماعات)`,
      labelEn: `Record meeting & action items (${metrics.meetingsCount})`,
      done: metrics.meetingsCount > 0,
      href: `${baseUrl}/meetings`,
      guideId: "meetings-workflow",
    },
    {
      id: "chk-doc",
      labelAr: `ارفع مستند رسمي ببصمة SHA-256 (${metrics.documentsCount} ملفات)`,
      labelEn: `Upload official document (${metrics.documentsCount})`,
      done: metrics.documentsCount > 0,
      href: `${baseUrl}/documents`,
      guideId: "documents-versioning",
    },
    {
      id: "chk-tour",
      labelAr: "خُد جولة تعليمية واحدة على الأقل في النظام",
      labelEn: "Complete at least one interactive guide tour",
      done: state.completedGuides.length > 0,
      href: `${baseUrl}/overview`,
      guideId: "full-workflow",
    },
  ];

  const doneCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const pct = Math.round((doneCount / totalCount) * 100);

  return (
    <div className="fixed bottom-20 md:bottom-5 end-4 z-30 max-w-xs w-full pointer-events-auto">
      {state.checklistMinimized ? (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={toggleChecklistMinimized}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#12301E] text-[#ECEFE9] border border-[#C89B2C]/50 shadow-modal hover:bg-[#163A24] transition-all cursor-pointer text-xs"
          >
            <Compass className="h-4 w-4 text-[#DFB244]" />
            <span className="font-semibold">
              {isAr ? "خطوات البداية" : "Onboarding"}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#C89B2C]/20 text-[#DFB244] font-mono text-[10px] font-bold">
              {doneCount}/{totalCount}
            </span>
            <ChevronUp className="h-3.5 w-3.5 text-[#DFB244]" />
          </button>
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[var(--gold-border)] bg-[var(--surface)] shadow-modal overflow-hidden text-start">
          {/* Header */}
          <div className="bg-[#12301E] text-[#ECEFE9] px-4 py-3 flex items-center justify-between border-b border-[#C89B2C]/30">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  {isAr ? "قائمة تأسيس المشروع الذكية" : "Smart Project Checklist"}
                </span>
                <Badge variant="gold" size="sm">
                  {doneCount}/{totalCount}
                </Badge>
              </div>
              <p className="text-[10px] text-[#B7E6C9]/85 mt-0.5">
                {isAr
                  ? "مربوطة تلقائيًا ببيانات مشروعك الفعلية"
                  : "Synced with live project data"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleChecklistMinimized}
                title={isAr ? "تصغير" : "Minimize"}
                className="h-6 w-6 rounded flex items-center justify-center text-white/75 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={dismissChecklist}
                title={isAr ? "إخفاء القائمة" : "Dismiss"}
                className="h-6 w-6 rounded flex items-center justify-center text-white/75 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1 w-full bg-[var(--surface-subtle)]">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Items */}
          <div className="p-3 space-y-1.5 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-[var(--radius-sm)] hover:bg-[var(--surface-hover)] flex items-center justify-between gap-2 text-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => router.push(item.href)}
                  className="flex items-center gap-2 text-start min-w-0 flex-1 cursor-pointer"
                >
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 text-[var(--success)] shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-[var(--gold)] shrink-0" />
                  )}
                  <span
                    className={`truncate ${
                      item.done
                        ? "text-[var(--ink-secondary)] line-through"
                        : "text-[var(--ink)] font-semibold"
                    }`}
                  >
                    {isAr ? item.labelAr : item.labelEn}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => startGuide(item.guideId)}
                  title={isAr ? "شغّل شرح الخطوة" : "Start step guide"}
                  className="px-1.5 py-0.5 rounded bg-[var(--primary-subtle)] text-[var(--accent)] text-[10px] font-semibold hover:bg-[var(--accent)] hover:text-white transition-colors shrink-0 flex items-center gap-0.5 cursor-pointer"
                >
                  <Play className="h-2.5 w-2.5" />
                  <span>{isAr ? "شرح" : "Guide"}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-3.5 py-2 bg-[var(--surface-subtle)] border-t border-[var(--border)] flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={openGuideCenter}
              className="font-semibold text-[var(--accent)] hover:underline cursor-pointer"
            >
              {isAr ? "افتح دليل النظام الكامل ←" : "Open Full Guide Center →"}
            </button>
            <button
              type="button"
              onClick={() => startGuide("full-workflow")}
              className="text-[var(--gold-text)] font-semibold hover:underline cursor-pointer"
            >
              {isAr ? "جولة شاملة" : "Full Tour"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

