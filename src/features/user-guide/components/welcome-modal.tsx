"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useTranslation } from "@/i18n/context";
import { useUserGuide } from "../engine/guide-context";
import {
  Compass,
  Briefcase,
  Sparkles,
  CheckCircle2,
  BookOpen,
  LayoutDashboard,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

export function WelcomeAndCompletionModals() {
  const { locale } = useTranslation();
  const router = useRouter();
  const {
    isWelcomeOpen,
    closeWelcomeModal,
    completeWelcome,
    userRole,
    projectSlug,
    isCompletionModalOpen,
    closeCompletionModal,
    lastCompletedGuide,
    openGuideCenter,
  } = useUserGuide();

  const [step, setStep] = useState<1 | 2>(1);
  const isAr = locale === "ar";

  const roleBadgeLabel =
    userRole === "SUPERVISOR"
      ? isAr
        ? "المشرف الأكاديمي"
        : "Academic Supervisor"
      : userRole === "TEAM_LEADER"
      ? isAr
        ? "قائد الفريق (Team Leader)"
        : "Team Leader"
      : userRole === "SYSTEM_ADMIN" || userRole === "DEPARTMENT_ADMIN"
      ? isAr
        ? "منسق القسم العلمي"
        : "Department Admin"
      : isAr
      ? "عضو الفريق الهندسي"
      : "Project Team Member";

  return (
    <>
      {/* 1. First-Time 2-Step Welcome Experience */}
      <Dialog
        open={isWelcomeOpen}
        onOpenChange={(open) => {
          if (!open) closeWelcomeModal();
        }}
      >
        <DialogContent
          hideCloseButton
          className="max-w-lg p-0 gap-0 overflow-hidden border border-[var(--gold-border)] shadow-modal"
        >
          {/* Top Editorial Forest Banner */}
          <div className="bg-[#12301E] text-[#ECEFE9] p-6 border-b border-[#C89B2C]/30 text-start">
            <div className="flex items-center justify-between gap-2 mb-4">
              <BrandLogo size="sm" showText />
              <Badge variant="gold" size="sm">
                {roleBadgeLabel}
              </Badge>
            </div>

            {step === 1 ? (
              <div className="space-y-2">
                <DialogTitle className="text-xl font-bold text-white tracking-tight">
                  {isAr ? "أهلًا بيك في SVA-DUATE" : "Welcome to SVA-DUATE"}
                </DialogTitle>
                <p className="text-xs text-[#B7E6C9]/90 leading-relaxed">
                  {isAr
                    ? "هنا هتدير مشروع التخرج من أول التخطيط لحد يوم المناقشة، وكل شغل الفريق هيبقى في مكان واحد من غير تشتت."
                    : "Manage your graduation project from initial planning to defense day, with all team workflows connected in one place."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <DialogTitle className="text-xl font-bold text-white tracking-tight">
                  {isAr ? "إنت داخل تعمل إيه دلوقتي؟" : "What would you like to do first?"}
                </DialogTitle>
                <p className="text-xs text-[#B7E6C9]/90 leading-relaxed">
                  {isAr
                    ? "اختار نقطة البداية المناسبة ليك دلوقتي، وهنمشي معاك خطوة بخطوة بهدوء:"
                    : "Choose your starting point and we will guide you through the right workflow:"}
                </p>
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-6 bg-[var(--surface)] text-start space-y-5">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-1 gap-3 text-xs">
                  <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--surface-subtle)] border border-[var(--border)] flex items-start gap-3">
                    <div className="h-8 w-8 rounded-[var(--radius-sm)] bg-[var(--primary-subtle)] text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
                      <Compass className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[var(--ink)] block mb-0.5">
                        {isAr
                          ? "دورة عمل واحدة مترابطة (مش مجرد صفحات منفصلة)"
                          : "One Connected Project Lifecycle"}
                      </span>
                      <span className="text-[var(--ink-secondary)] leading-relaxed">
                        {isAr
                          ? "الخطة بتتحول لمحطات (Milestones)، والمحطات لمهام، والاجتماعات لـ Action Items، وكل ده بيصب في التسليم النهائي ويوم المناقشة."
                          : "Roadmap phases feed into milestones, tasks, meetings, supervisor feedback, and final defense readiness."}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--surface-subtle)] border border-[var(--border)] flex items-start gap-3">
                    <div className="h-8 w-8 rounded-[var(--radius-sm)] bg-[var(--gold-subtle)] text-[var(--gold-text)] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[var(--ink)] block mb-0.5">
                        {isAr
                          ? "دليل تفاعلي معاك وقت ما تحتاجه"
                          : "Interactive Guidance Whenever You Need It"}
                      </span>
                      <span className="text-[var(--ink-secondary)] leading-relaxed">
                        {isAr
                          ? "في أقل من دقيقتين هنوريك إزاي النظام ماشي، وتقدر توقف أو تعيد أي جولة في أي وقت من زر «دليل النظام» فوق."
                          : "Take a 2-minute interactive tour now, or replay any module guide anytime from the top bar."}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeWelcomeModal}
                    className="text-xs text-[var(--ink-secondary)]"
                  >
                    {isAr ? "هستكشف بنفسي" : "I'll explore on my own"}
                  </Button>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setStep(2)}
                    rightIcon={
                      isAr ? (
                        <ArrowLeft className="h-4 w-4" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )
                    }
                  >
                    {isAr ? "ابدأ الجولة" : "Start Guided Tour"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2.5">
                  {/* Option 1: Understand the Full Workflow first */}
                  <button
                    type="button"
                    onClick={() => completeWelcome("explore_system", "full-workflow")}
                    className="w-full text-start p-3.5 rounded-[var(--radius-md)] border border-[var(--accent)]/40 bg-[var(--primary-subtle)]/40 hover:bg-[var(--primary-subtle)] transition-all flex items-start gap-3.5 cursor-pointer group"
                  >
                    <div className="h-9 w-9 rounded-[var(--radius-sm)] bg-[var(--accent)] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Compass className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-[var(--ink)]">
                          {isAr ? "أفهم النظام الأول (رحلة المشروع كاملة)" : "Understand the system first (Full Workflow)"}
                        </span>
                        <Badge variant="gold" size="sm">
                          {isAr ? "موصى به • ٣ دقايق" : "Recommended"}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--ink-secondary)] mt-1 leading-relaxed">
                        {isAr
                          ? "تعالى أوريك النظام ماشي إزاي من أول الخطة والـ Milestones لحد تجميد التسليم ويوم المناقشة."
                          : "See how planning, tasks, meetings, supervisor feedback, and defense connect end-to-end."}
                      </p>
                    </div>
                  </button>

                  {/* Option 2: Role-aware immediate work */}
                  {userRole === "SUPERVISOR" ? (
                    <button
                      type="button"
                      onClick={() => completeWelcome("lead_or_review", "supervisor-feedback")}
                      className="w-full text-start p-3.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] transition-all flex items-start gap-3.5 cursor-pointer"
                    >
                      <div className="h-9 w-9 rounded-[var(--radius-sm)] bg-[var(--gold-subtle)] text-[var(--gold-text)] flex items-center justify-center shrink-0 mt-0.5">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-[var(--ink)] block">
                          {isAr
                            ? "أراجع تقدم الفريق وأسجل ملاحظات الإشراف"
                            : "Review Team Progress & Log Supervisor Feedback"}
                        </span>
                        <p className="text-xs text-[var(--ink-secondary)] mt-1 leading-relaxed">
                          {isAr
                            ? "ابدأ مباشرة من صندوق ملاحظات المشرف واعتمادات المحطات."
                            : "Jump directly to the supervisor feedback and milestone approval workflow."}
                        </p>
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => completeWelcome("daily_work", "tasks-workflow")}
                      className="w-full text-start p-3.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] transition-all flex items-start gap-3.5 cursor-pointer"
                    >
                      <div className="h-9 w-9 rounded-[var(--radius-sm)] bg-[var(--surface-subtle)] text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-bold text-[var(--ink)] block">
                          {isAr
                            ? "أنضم لفريقي وأشوف المهام المطلوبة دلوقتي"
                            : "Jump into My Team's Tasks & Daily Work"}
                        </span>
                        <p className="text-xs text-[var(--ink-secondary)] mt-1 leading-relaxed">
                          {isAr
                            ? "ادخل علطول على لوحة المهام (Kanban) عشان تعرف إيه المطلوب منك وإزاي تحرك شغلك."
                            : "Start directly on the Task Board to see assigned work and checklists."}
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Option 3: Start a new project or understand Dashboard */}
                  <button
                    type="button"
                    onClick={() => completeWelcome("lead_or_review", "dashboard-command")}
                    className="w-full text-start p-3.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface-hover)] transition-all flex items-start gap-3.5 cursor-pointer"
                  >
                    <div className="h-9 w-9 rounded-[var(--radius-sm)] bg-[var(--surface-subtle)] text-[var(--gold-text)] flex items-center justify-center shrink-0 mt-0.5">
                      <LayoutDashboard className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-[var(--ink)] block">
                        {isAr
                          ? "أفهم لوحة القيادة ومؤشر صحة المشروع"
                          : "Explore the Command Dashboard & Health Engine"}
                      </span>
                      <p className="text-xs text-[var(--ink-secondary)] mt-1 leading-relaxed">
                        {isAr
                          ? "جولة سريعة في الصفحة الرئيسية تشرحلك إزاي تتابع حالة المشروع في ٥ ثواني."
                          : "A focused 1-minute tour of the Executive Overview and Health Ring."}
                      </p>
                    </div>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="text-xs text-[var(--ink-secondary)]"
                  >
                    {isAr ? "رجوع" : "Back"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeWelcomeModal}
                    className="text-xs text-[var(--ink-secondary)]"
                  >
                    {isAr ? "تخطي دلوقتي" : "Skip for now"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Calm, Mature Journey Completion Modal (Zero Confetti) */}
      <Dialog
        open={isCompletionModalOpen}
        onOpenChange={(open) => {
          if (!open) closeCompletionModal();
        }}
      >
        <DialogContent className="max-w-md p-6 border border-[var(--gold-border)] text-start space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[var(--primary-subtle)] border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <Badge variant="gold" size="sm">
                {isAr ? "اكتملت الجولة بنجاح" : "Guide Completed"}
              </Badge>
              <DialogTitle className="text-base font-bold text-[var(--ink)] mt-1">
                {isAr
                  ? "كده إنت عرفت دورة المشروع"
                  : "You've Completed the Workflow Guide"}
              </DialogTitle>
            </div>
          </div>

          <p className="text-xs text-[var(--ink-secondary)] leading-relaxed bg-[var(--surface-subtle)] p-3.5 rounded-[var(--radius-sm)] border border-[var(--border-subtle)]">
            {isAr
              ? `خلصت «${lastCompletedGuide?.titleAr || "الجولة التعليمية"}». من هنا الشغل الحقيقي هيبدأ — لوحة القيادة (Overview) هتفضل أسرع مكان تعرف منه المشروع محتاج إيه، وتقدر ترجع لدليل النظام في أي وقت.`
              : `You completed "${lastCompletedGuide?.titleEn}". From here, real work begins—the Overview dashboard is always your fastest way to see what the project needs next.`}
          </p>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<BookOpen className="h-3.5 w-3.5 text-[var(--gold-text)]" />}
              onClick={() => {
                closeCompletionModal();
                openGuideCenter();
              }}
            >
              {isAr ? "استكشف دليل النظام" : "Open Guide Center"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                closeCompletionModal();
                router.push(`/app/p/${projectSlug}/overview`);
              }}
            >
              {isAr ? "روح للـ Dashboard" : "Go to Dashboard"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

