"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/i18n/context";
import { useUserGuide } from "../engine/guide-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Compass,
  Hand,
} from "lucide-react";

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function SpotlightOverlay() {
  const { locale } = useTranslation();
  const pathname = usePathname();
  const {
    activeGuide,
    activeSteps,
    activeStep,
    activeStepIndex,
    nextStep,
    prevStep,
    skipGuide,
    pauseGuide,
    metrics,
    userRole,
    actionFeedbackMessage,
  } = useUserGuide();

  const [rect, setRect] = useState<TargetRect | null>(null);
  const [viewport, setViewport] = useState({ width: 1280, height: 800 });

  const isAr = locale === "ar";

  // Locate target DOM element `[data-guide="..."]` and track its bounding box
  useEffect(() => {
    if (!activeGuide || !activeStep) {
      setRect(null);
      return;
    }

    const updateDimensions = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      if (!activeStep.target) {
        setRect(null);
        return;
      }

      const el = document.querySelector(
        `[data-guide="${activeStep.target}"]`
      ) as HTMLElement | null;

      if (!el) {
        setRect(null);
        return;
      }

      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) {
        setRect(null);
        return;
      }

      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    };

    // Scroll target smoothly into view on step change
    const scrollTargetIntoView = () => {
      if (!activeStep.target) return;
      const el = document.querySelector(
        `[data-guide="${activeStep.target}"]`
      ) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
    };

    const t1 = setTimeout(() => {
      scrollTargetIntoView();
      updateDimensions();
    }, 120);
    const t2 = setTimeout(updateDimensions, 380);

    window.addEventListener("resize", updateDimensions);
    window.addEventListener("scroll", updateDimensions, true);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("scroll", updateDimensions, true);
    };
  }, [activeGuide, activeStep, pathname]);

  // Keyboard navigation: Escape to pause, Arrow keys to step
  useEffect(() => {
    if (!activeGuide || !activeStep) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (isInput) return;

      if (e.key === "Escape") {
        e.preventDefault();
        pauseGuide();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isAr) {
          prevStep();
        } else {
          nextStep();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (isAr) {
          nextStep();
        } else {
          prevStep();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeGuide, activeStep, isAr, nextStep, pauseGuide, prevStep]);

  if (!activeGuide || !activeStep) return null;

  const isMobile = viewport.width < 768;
  const pad = 8;
  const cutout = rect
    ? {
        x: Math.max(4, rect.left - pad),
        y: Math.max(4, rect.top - pad),
        w: Math.min(viewport.width - 8, rect.width + pad * 2),
        h: Math.min(viewport.height - 8, rect.height + pad * 2),
      }
    : null;

  // Compute desktop card position relative to spotlight cutout
  const cardWidth = 390;
  let cardStyle: React.CSSProperties = {};

  if (!isMobile && cutout) {
    const spaceBelow = viewport.height - (cutout.y + cutout.h);
    const spaceAbove = cutout.y;
    const clampedLeft = Math.max(
      16,
      Math.min(
        viewport.width - cardWidth - 16,
        cutout.x + cutout.w / 2 - cardWidth / 2
      )
    );

    if (spaceBelow >= 260 || spaceBelow >= spaceAbove) {
      cardStyle = {
        top: Math.min(viewport.height - 310, cutout.y + cutout.h + 14),
        left: clampedLeft,
        width: cardWidth,
      };
    } else {
      cardStyle = {
        top: Math.max(16, cutout.y - 290),
        left: clampedLeft,
        width: cardWidth,
      };
    }
  } else if (!isMobile) {
    cardStyle = {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: cardWidth,
    };
  }

  const bodyCopy = isAr
    ? activeStep.getDynamicContentAr
      ? activeStep.getDynamicContentAr(metrics, userRole)
      : activeStep.contentAr
    : activeStep.contentEn;

  const isLastStep = activeStepIndex === activeSteps.length - 1;
  const nextLabel = isAr
    ? activeStep.nextButtonLabelAr || (isLastStep ? "إنهاء الجولة" : "التالي")
    : activeStep.nextButtonLabelEn || (isLastStep ? "Finish Tour" : "Next");

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      role="dialog"
      aria-modal="false"
      aria-label={isAr ? activeStep.titleAr : activeStep.titleEn}
    >
      {/* 1. SVG Dimmed Scrim with Transparent Cutout so target remains clickable */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none transition-all duration-200"
        aria-hidden="true"
      >
        <defs>
          <mask id="capstone-guide-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {cutout && (
              <rect
                x={cutout.x}
                y={cutout.y}
                width={cutout.w}
                height={cutout.h}
                rx="10"
                ry="10"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(11, 17, 14, 0.56)"
          mask="url(#capstone-guide-spotlight-mask)"
        />
      </svg>

      {/* 2. Restrained Muted Gold Frame around Spotlighted Element */}
      {cutout && (
        <div
          className="fixed pointer-events-none rounded-[10px] border-[1.5px] border-[var(--gold)] shadow-[0_0_0_4px_rgba(200,155,44,0.16)] transition-all duration-200"
          style={{
            top: cutout.y,
            left: cutout.x,
            width: cutout.w,
            height: cutout.h,
          }}
        >
          <span className="absolute -top-3 start-3 px-2 py-0.5 rounded-full bg-[#12301E] text-[#DFB244] border border-[#C89B2C]/50 text-[10px] font-bold shadow-xs">
            {activeStepIndex + 1} / {activeSteps.length}
          </span>
        </div>
      )}

      {/* 3. Editorial Guide Card (Anchored on Desktop, Bottom Sheet on Mobile) */}
      <div
        style={isMobile ? undefined : cardStyle}
        className={
          isMobile
            ? "fixed inset-x-0 bottom-0 z-50 pointer-events-auto bg-[var(--surface)] border-t-2 border-[var(--gold)] rounded-t-2xl p-5 shadow-modal space-y-3.5 text-start transition-all duration-200"
            : "fixed z-50 pointer-events-auto bg-[var(--surface)] border border-[var(--gold-border)] rounded-[var(--radius-lg)] p-5 shadow-modal space-y-3.5 text-start transition-all duration-200"
        }
      >
        {/* Top Accent Line */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="gold" size="sm">
              {isAr ? activeStep.categoryAr : activeStep.categoryEn}
            </Badge>
            <span className="text-[11px] font-mono text-[var(--ink-muted)] truncate">
              {activeStepIndex + 1} {isAr ? "من" : "of"} {activeSteps.length}
            </span>
          </div>

          <button
            type="button"
            onClick={pauseGuide}
            title={isAr ? "إيقاف مؤقت وحفظ مكانك (Esc)" : "Pause and save progress (Esc)"}
            className="h-6 w-6 rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Title & Egyptian Explanation */}
        <div className="space-y-1.5">
          <h3 className="text-sm sm:text-base font-bold text-[var(--ink)] leading-snug">
            {isAr ? activeStep.titleAr : activeStep.titleEn}
          </h3>
          <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
            {bodyCopy}
          </p>
        </div>

        {/* Why It Matters / Next Logical Step Callout */}
        {(activeStep.whyItMattersAr || activeStep.nextLogicalStepAr) && (
          <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-subtle)] border-s-2 border-[var(--accent)] text-[11px] space-y-1">
            {activeStep.whyItMattersAr && (
              <p className="text-[var(--ink)] font-medium">
                <Sparkles className="h-3 w-3 inline text-[var(--gold-text)] me-1" />
                {isAr ? activeStep.whyItMattersAr : activeStep.whyItMattersEn}
              </p>
            )}
            {activeStep.nextLogicalStepAr && (
              <p className="text-[var(--ink-secondary)]">
                <Compass className="h-3 w-3 inline text-[var(--accent)] me-1" />
                {isAr ? activeStep.nextLogicalStepAr : activeStep.nextLogicalStepEn}
              </p>
            )}
          </div>
        )}

        {/* Interactive Learning-by-Doing Prompt or Success Feedback */}
        {actionFeedbackMessage ? (
          <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--success-subtle)] border border-[var(--success)]/30 text-xs text-[var(--success)] font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{actionFeedbackMessage}</span>
          </div>
        ) : activeStep.actionPromptAr ? (
          <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--copper-subtle)] border border-[var(--copper)]/30 text-[11px] text-[var(--ink)] flex items-start gap-2">
            <Hand className="h-3.5 w-3.5 text-[var(--copper)] shrink-0 mt-0.5" />
            <span>
              <strong className="text-[var(--copper)]">
                {isAr ? "جرّب بنفسك: " : "Try it now: "}
              </strong>
              {isAr ? activeStep.actionPromptAr : activeStep.actionPromptEn}
            </span>
          </div>
        ) : null}

        {/* Progress Bar */}
        <div className="w-full h-1 rounded-full bg-[var(--surface-subtle)] overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-200"
            style={{
              width: `${Math.round(((activeStepIndex + 1) / activeSteps.length) * 100)}%`,
            }}
          />
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between pt-1 gap-2">
          <button
            type="button"
            onClick={skipGuide}
            className="text-[11px] font-medium text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          >
            {isAr ? "تخطي دلوقتي" : "Skip for now"}
          </button>

          <div className="flex items-center gap-2">
            {activeStepIndex > 0 && (
              <Button
                variant="outline"
                size="xs"
                onClick={prevStep}
                leftIcon={
                  isAr ? (
                    <ArrowRight className="h-3 w-3" />
                  ) : (
                    <ArrowLeft className="h-3 w-3" />
                  )
                }
              >
                {isAr ? "السابق" : "Previous"}
              </Button>
            )}

            <Button
              variant="primary"
              size="xs"
              onClick={nextStep}
              rightIcon={
                !activeStep.nextButtonLabelAr ? (
                  isAr ? (
                    <ArrowLeft className="h-3 w-3" />
                  ) : (
                    <ArrowRight className="h-3 w-3" />
                  )
                ) : undefined
              }
            >
              {nextLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

