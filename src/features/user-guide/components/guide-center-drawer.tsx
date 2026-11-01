"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/i18n/context";
import { useUserGuide } from "../engine/guide-context";
import {
  KEYBOARD_SHORTCUTS_GUIDE,
  WORKFLOW_STAGES,
} from "../content/guides-catalog";
import {
  BookOpen,
  Search,
  Play,
  RotateCcw,
  CheckCircle2,
  Compass,
  Clock,
  Sparkles,
  Keyboard,
  ArrowUpRight,
  Layers,
  X,
} from "lucide-react";

export function GuideCenterDrawer() {
  const { locale } = useTranslation();
  const router = useRouter();
  const {
    isGuideCenterOpen,
    closeGuideCenter,
    availableGuides,
    state,
    startGuide,
    pausedGuide,
    resumePausedGuide,
    dismissPausedGuide,
    projectSlug,
    reopenChecklist,
    openWelcomeModal,
  } = useUserGuide();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStageId, setSelectedStageId] = useState<string>(
    WORKFLOW_STAGES[0]?.id || "stage-plan"
  );
  const [activeTab, setActiveTab] = useState<"map" | "guides" | "shortcuts">("map");

  const isAr = locale === "ar";

  const selectedStage = useMemo(
    () =>
      WORKFLOW_STAGES.find((s) => s.id === selectedStageId) || WORKFLOW_STAGES[0]!,
    [selectedStageId]
  );

  // Filter guides by natural search query (e.g. "ازاي أضيف ملاحظة المشرف؟")
  const filteredGuides = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return availableGuides;

    return availableGuides.filter((g) => {
      const haystack = [
        g.titleAr,
        g.titleEn,
        g.summaryAr,
        g.summaryEn,
        g.categoryLabelAr,
        ...g.keywords,
        ...g.steps.map((s) => `${s.titleAr} ${s.contentAr} ${s.titleEn}`),
      ]
        .join(" ")
        .toLowerCase();

      // Match full query or individual significant tokens
      if (haystack.includes(q)) return true;
      const tokens = q.split(/\s+/).filter((t) => t.length > 2);
      return tokens.length > 0 && tokens.some((tok) => haystack.includes(tok));
    });
  }, [availableGuides, searchQuery]);

  const completedCount = state.completedGuides.filter((id) =>
    availableGuides.some((g) => g.id === id)
  ).length;
  const totalCount = availableGuides.length;

  return (
    <Dialog
      open={isGuideCenterOpen}
      onOpenChange={(open) => {
        if (!open) closeGuideCenter();
      }}
    >
      <DialogContent
        hideCloseButton
        className="max-w-4xl w-[95vw] max-h-[88vh] p-0 gap-0 overflow-hidden flex flex-col border border-[var(--gold-border)] shadow-modal"
      >
        {/* Top Institutional Header */}
        <div className="bg-[#12301E] text-[#ECEFE9] px-6 py-4 border-b border-[#C89B2C]/30 flex flex-wrap items-center justify-between gap-4 text-start shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#DFB244] shrink-0" />
              <Badge variant="gold" size="sm">
                {isAr ? "دليل استخدام النظام" : "USER GUIDE"}
              </Badge>
              <span className="text-[11px] text-[#B7E6C9]/80 font-mono">
                {isAr
                  ? `أكملت ${completedCount} من ${totalCount} جولة`
                  : `Completed ${completedCount} of ${totalCount} guides`}
              </span>
            </div>
            <DialogTitle className="text-lg font-bold text-white">
              {isAr
                ? "دليل النظام وخطوات العمل"
                : "System Guide & Workflow"}
            </DialogTitle>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="xs"
              onClick={() => {
                closeGuideCenter();
                reopenChecklist();
              }}
            >
              {isAr ? "قائمة البداية" : "Setup Checklist"}
            </Button>
            <Button
              variant="gold"
              size="xs"
              onClick={() => startGuide("full-workflow")}
              leftIcon={<Play className="h-3 w-3" />}
            >
              {isAr ? "بدء جولة النظام" : "Full Tour"}
            </Button>
            <button
              type="button"
              onClick={closeGuideCenter}
              className="h-7 w-7 rounded-[var(--radius-sm)] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              aria-label="Close guide center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Resume Paused Tour Banner ("نكمل من آخر حاجة وقفنا عندها؟") */}
        {pausedGuide && (
          <div className="px-6 py-2.5 bg-[var(--gold-subtle)] border-b border-[var(--gold-border)] flex flex-wrap items-center justify-between gap-2 text-xs text-start shrink-0">
            <div className="flex items-center gap-2 text-[var(--ink)]">
              <Sparkles className="h-4 w-4 text-[var(--gold-text)] shrink-0" />
              <span>
                <strong>
                  {isAr
                    ? "نكمل من آخر حاجة وقفنا عندها؟ "
                    : "Resume where you left off? "}
                </strong>
                {isAr ? pausedGuide.titleAr : pausedGuide.titleEn} (
                {isAr ? `الخطوة ${state.pausedStepIndex + 1}` : `Step ${state.pausedStepIndex + 1}`})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="primary" size="xs" onClick={resumePausedGuide}>
                {isAr ? "كمّل الجولة" : "Resume Tour"}
              </Button>
              <button
                type="button"
                onClick={dismissPausedGuide}
                className="text-[11px] text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer"
              >
                {isAr ? "تجاهل" : "Dismiss"}
              </button>
            </div>
          </div>
        )}

        {/* Search & View Switcher Bar */}
        <div className="px-6 py-3 bg-[var(--surface-subtle)] border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("map")}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "map"
                  ? "bg-[var(--primary-subtle)] text-[var(--accent)]"
                  : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
              }`}
            >
              <Compass className="h-3.5 w-3.5 shrink-0" />
              <span>{isAr ? "مراحل العمل" : "Workflow Stages"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("guides")}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "guides"
                  ? "bg-[var(--primary-subtle)] text-[var(--accent)]"
                  : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
              }`}
            >
              <Layers className="h-3.5 w-3.5 shrink-0" />
              <span>
                {isAr ? `جميع الجولات (${availableGuides.length})` : `All Guides (${availableGuides.length})`}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("shortcuts")}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "shortcuts"
                  ? "bg-[var(--primary-subtle)] text-[var(--accent)]"
                  : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
              }`}
            >
              <Keyboard className="h-3.5 w-3.5 shrink-0" />
              <span>{isAr ? "اختصارات لوحة المفاتيح" : "Shortcuts"}</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search className="h-3.5 w-3.5 absolute start-3 top-2.5 text-[var(--ink-muted)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim() && activeTab !== "guides") {
                  setActiveTab("guides");
                }
              }}
              placeholder={
                isAr
                  ? "بحث في الدليل (مثال: المهام، ملاحظات المشرف، التسليم)..."
                  : "Search guides..."
              }
              className="h-8 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] ps-8 pe-3 text-xs text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[var(--surface)] text-start space-y-6">
          {activeTab === "map" && (
            <div className="space-y-5">
              {/* Interactive 5-Stage Pipeline */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-muted)] mb-3">
                  {isAr
                    ? "اضغط على أي مرحلة عشان تشوف دورها والشاشات المرتبطة بيها:"
                    : "Click any stage to explore its purpose and connected modules:"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {WORKFLOW_STAGES.map((stage) => {
                    const isSelected = stage.id === selectedStage.id;
                    const isDone = state.completedGuides.includes(stage.linkedGuideId);
                    return (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() => setSelectedStageId(stage.id)}
                        className={`p-3 rounded-[var(--radius-md)] border text-start transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-[var(--accent)] bg-[var(--primary-subtle)] shadow-xs"
                            : "border-[var(--border)] bg-[var(--surface-subtle)]/50 hover:border-[var(--border-strong)]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              isSelected
                                ? "bg-[var(--accent)] text-white"
                                : "bg-[var(--surface)] text-[var(--ink-secondary)]"
                            }`}
                          >
                            {isAr ? `مرحلة ${stage.number}` : `Stage ${stage.number}`}
                          </span>
                          {isDone && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)] shrink-0" />
                          )}
                        </div>
                        <div className="text-xs font-bold text-[var(--ink)] leading-snug">
                          {isAr ? stage.titleAr : stage.titleEn}
                        </div>
                        <div className="text-[10px] text-[var(--ink-muted)] mt-1 font-mono truncate">
                          {isAr ? stage.subtitleAr : stage.subtitleEn}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Stage Detail Panel */}
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-subtle)]/40 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                  <div>
                    <Badge variant="gold" size="sm">
                      {isAr ? `المرحلة ${selectedStage.number} من ٥` : `Stage ${selectedStage.number} of 5`}
                    </Badge>
                    <h4 className="text-base font-bold text-[var(--ink)] mt-1">
                      {isAr ? selectedStage.titleAr : selectedStage.titleEn}
                    </h4>
                    <p className="text-xs text-[var(--ink-secondary)] mt-0.5 leading-relaxed">
                      {isAr ? selectedStage.descriptionAr : selectedStage.descriptionEn}
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => startGuide(selectedStage.linkedGuideId)}
                    leftIcon={<Play className="h-3.5 w-3.5" />}
                  >
                    {isAr ? "بدء جولة المرحلة" : "Start Stage Tour"}
                  </Button>
                </div>

                {/* Golden Rule */}
                <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--gold-subtle)] border border-[var(--gold-border)] text-xs text-[var(--ink)] flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--gold-text)] shrink-0" />
                  <span>{selectedStage.practicalRuleAr}</span>
                </div>

                {/* Connected Modules inside this Stage */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedStage.modules.map((mod) => (
                    <div
                      key={mod.route}
                      className="p-3.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-bold text-[var(--ink)]">
                          {isAr ? mod.nameAr : mod.nameEn}
                        </div>
                        <p className="text-[11px] text-[var(--ink-secondary)] mt-1 leading-relaxed">
                          {mod.summaryAr}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                        <button
                          type="button"
                          onClick={() => startGuide(mod.guideId)}
                          className="text-[11px] font-semibold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="h-3 w-3" />
                          <span>{isAr ? "شرح تفاعلي" : "Interactive Tour"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            closeGuideCenter();
                            router.push(`/app/p/${projectSlug}${mod.route}`);
                          }}
                          className="text-[11px] text-[var(--ink-secondary)] hover:text-[var(--ink)] flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>{isAr ? "افتح الشاشة" : "Open"}</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "guides" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredGuides.map((g) => {
                const isDone = state.completedGuides.includes(g.id);
                return (
                  <div
                    key={g.id}
                    className={`p-4 rounded-[var(--radius-md)] border transition-all flex flex-col justify-between gap-3 ${
                      g.id === "full-workflow"
                        ? "border-[var(--gold-border)] bg-[var(--gold-subtle)]/20 md:col-span-2"
                        : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={g.id === "full-workflow" ? "gold" : "default"}
                            size="sm"
                          >
                            {isAr ? g.categoryLabelAr : g.categoryLabelEn}
                          </Badge>
                          <span className="text-[10px] font-mono text-[var(--ink-muted)]">
                            {g.deepLink}
                          </span>
                        </div>

                        {isDone ? (
                          <Badge variant="success" size="sm" dot>
                            {isAr ? "مكتملة" : "Completed"}
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-[var(--ink-muted)] flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {g.estimatedMinutes} {isAr ? "دقايق" : "min"}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-[var(--ink)]">
                        {isAr ? g.titleAr : g.titleEn}
                      </h4>
                      <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                        {isAr ? g.summaryAr : g.summaryEn}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-[var(--border-subtle)]">
                      <span className="text-[11px] text-[var(--ink-muted)]">
                        {g.steps.length} {isAr ? "خطوات تفاعلية" : "interactive steps"}
                      </span>

                      <Button
                        variant={isDone ? "outline" : "primary"}
                        size="xs"
                        onClick={() => startGuide(g.id)}
                        leftIcon={
                          isDone ? (
                            <RotateCcw className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )
                        }
                      >
                        {isDone
                          ? isAr
                            ? "شغّل الجولة تاني"
                            : "Replay Tour"
                          : isAr
                          ? "ابدأ الجولة"
                          : "Start Tour"}
                      </Button>
                    </div>
                  </div>
                );
              })}

              {filteredGuides.length === 0 && (
                <div className="col-span-full py-10 text-center text-xs text-[var(--ink-secondary)] border border-dashed border-[var(--border)] rounded-[var(--radius-md)]">
                  {isAr
                    ? "مفيش جولة مطابقة للكلمة دي — جرّب تكتب: مهام، مشرف، اجتماع، تسليم، أو مناقشة."
                    : "No matching guide found. Try searching for tasks, feedback, meetings, or defense."}
                </div>
              )}
            </div>
          )}

          {activeTab === "shortcuts" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {KEYBOARD_SHORTCUTS_GUIDE.map((sc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-subtle)]/50 flex items-center justify-between gap-3"
                  >
                    <span className="text-xs text-[var(--ink)] font-medium">
                      {isAr ? sc.labelAr : sc.labelEn}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {sc.keys.map((k) => (
                        <kbd
                          key={k}
                          className="px-2 py-1 text-[11px] font-mono font-bold rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)] shadow-2xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-subtle)] flex items-center justify-between">
                <div className="text-xs">
                  <span className="font-bold text-[var(--ink)] block">
                    {isAr
                      ? "عايز تعيد شاشة الترحيب واختيار الهدف من الأول؟"
                      : "Want to reopen the initial welcome & role intent selector?"}
                  </span>
                  <span className="text-[var(--ink-secondary)]">
                    {isAr
                      ? "تقدر تفتح شاشة البداية وتختار مسار مختلف في أي وقت."
                      : "Reopen the welcome modal anytime."}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    closeGuideCenter();
                    openWelcomeModal();
                  }}
                >
                  {isAr ? "افتح شاشة الترحيب" : "Open Welcome Screen"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

