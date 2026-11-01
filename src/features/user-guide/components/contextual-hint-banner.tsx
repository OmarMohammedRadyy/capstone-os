"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/i18n/context";
import { useUserGuide } from "../engine/guide-context";
import { CONTEXTUAL_PAGE_HINTS } from "../content/guides-catalog";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Play,
  X,
  Compass,
  BookOpen,
  RotateCcw,
} from "lucide-react";

export function ContextualHintBanner() {
  const { locale } = useTranslation();
  const pathname = usePathname();
  const {
    isHydrated,
    projectSlug,
    state,
    activeGuide,
    pausedGuide,
    resumePausedGuide,
    dismissPausedGuide,
    dismissHint,
    startGuide,
    openGuideCenter,
  } = useUserGuide();

  if (!isHydrated || activeGuide) return null;

  const isAr = locale === "ar";
  const basePrefix = `/app/p/${projectSlug}`;
  const routeSuffix = pathname.startsWith(basePrefix)
    ? pathname.slice(basePrefix.length) || "/overview"
    : "/overview";

  // Hide on presentation full-screen view
  if (routeSuffix.startsWith("/defense/present")) {
    return null;
  }

  const pageHint = CONTEXTUAL_PAGE_HINTS.find((h) => h.route === routeSuffix);
  const isDismissed = pageHint ? state.dismissedHints.includes(pageHint.id) : true;

  return (
    <div className="mb-4 space-y-2.5">
      {/* 1. Resume Paused Tour Bar if user left mid-tour ("نكمل من آخر حاجة وقفنا عندها؟") */}
      {pausedGuide && (
        <div className="rounded-[var(--radius-md)] border border-[var(--gold-border)] bg-[var(--gold-subtle)] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-start">
          <div className="flex items-center gap-2 text-[var(--ink)]">
            <RotateCcw className="h-4 w-4 text-[var(--gold-text)] shrink-0" />
            <span>
              <strong>
                {isAr
                  ? "نكمل من آخر حاجة وقفنا عندها؟ "
                  : "Continue where we left off? "}
              </strong>
              «{isAr ? pausedGuide.titleAr : pausedGuide.titleEn}» —{" "}
              {isAr
                ? `الخطوة ${state.pausedStepIndex + 1} من ${pausedGuide.steps.length}`
                : `Step ${state.pausedStepIndex + 1} of ${pausedGuide.steps.length}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="primary" size="xs" onClick={resumePausedGuide}>
              {isAr ? "أيوه، كمّل الجولة" : "Resume Tour"}
            </Button>
            <button
              type="button"
              onClick={dismissPausedGuide}
              className="text-[11px] text-[var(--ink-secondary)] hover:text-[var(--ink)] px-1.5 cursor-pointer"
            >
              {isAr ? "تجاهل" : "Dismiss"}
            </button>
          </div>
        </div>
      )}

      {/* 2. First-Time Contextual Discovery Card OR Compact "? شرح الصفحة" Strip */}
      {pageHint && !isDismissed ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--accent)]/25 bg-[var(--surface)] p-3.5 shadow-2xs text-start">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--primary-subtle)] text-[var(--accent)] text-[10px] font-bold">
                  <Compass className="h-3 w-3" />
                  {isAr ? "دليل الشاشة السريع" : "Contextual Page Guide"}
                </span>
                <h4 className="text-xs font-bold text-[var(--ink)]">
                  {isAr ? pageHint.titleAr : pageHint.titleEn}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px] leading-relaxed">
                <div className="p-2 rounded bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                  <strong className="text-[var(--ink)] block">
                    {isAr ? "ليه الشاشة دي مهمة؟" : "Why this screen?"}
                  </strong>
                  <span className="text-[var(--ink-secondary)]">
                    {isAr ? pageHint.whyAr : pageHint.whyEn}
                  </span>
                </div>

                <div className="p-2 rounded bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                  <strong className="text-[var(--accent)] block">
                    {isAr ? "تعمل إيه هنا أولًا؟" : "What to do here?"}
                  </strong>
                  <span className="text-[var(--ink-secondary)]">
                    {isAr ? pageHint.actionAr : pageHint.actionEn}
                  </span>
                </div>

                <div className="p-2 rounded bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                  <strong className="text-[var(--gold-text)] block">
                    {isAr ? "الخطوة المنطقية الجاية:" : "Next logical step:"}
                  </strong>
                  <span className="text-[var(--ink-secondary)]">
                    {isAr ? pageHint.nextStepAr : pageHint.nextStepEn}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-row lg:flex-col items-center lg:items-end justify-end gap-2 shrink-0">
              <Button
                variant="primary"
                size="xs"
                onClick={() => startGuide(pageHint.linkedGuideId)}
                leftIcon={<Play className="h-3 w-3" />}
              >
                {isAr ? "شغّل جولة الشاشة" : "Start Page Tour"}
              </Button>
              <button
                type="button"
                onClick={() => dismissHint(pageHint.id)}
                className="text-[11px] text-[var(--ink-muted)] hover:text-[var(--ink)] flex items-center gap-1 cursor-pointer"
              >
                <X className="h-3 w-3" />
                <span>{isAr ? "فهمت، ما تظهرش تاني" : "Got it, don't show again"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : pageHint ? (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => startGuide(pageHint.linkedGuideId)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] text-[11px] font-medium text-[var(--ink-secondary)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>{isAr ? "شرح الصفحة دي بالتفصيل" : "Explain this screen"}</span>
          </button>

          <button
            type="button"
            onClick={openGuideCenter}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--gold-border)] bg-[var(--gold-subtle)]/50 hover:bg-[var(--gold-subtle)] text-[11px] font-semibold text-[var(--gold-text)] transition-colors cursor-pointer"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>{isAr ? "دليل النظام" : "System Guide"}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

