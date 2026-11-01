"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ExperiencePermission,
  ExperienceStudioPayload,
  LandingSectionConfig,
  MediaAssetItem,
  SiteExperienceConfig,
} from "../types/experience-types";
import { CinematicLandingPage } from "./cinematic-landing-page";
import { CinematicSplash } from "./cinematic-splash";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Copy,
  Eye,
  Film,
  Globe,
  History,
  Image as ImageIcon,
  Laptop,
  Layers,
  Lock,
  Monitor,
  Moon,
  Palette,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Sun,
  Tablet,
  Trash2,
} from "lucide-react";

export interface LandingSplashStudioProps {
  projectSlug?: string;
}

type StudioTab =
  | "SECTIONS"
  | "SPLASH"
  | "TOKENS"
  | "MEDIA"
  | "SEO"
  | "VERSIONS";

type ViewportDevice = "DESKTOP" | "LAPTOP" | "TABLET" | "MOBILE";
type PreviewSurface =
  | "LANDING"
  | "SPLASH_FIRST"
  | "SPLASH_RECURRING"
  | "SPLASH_STATIC";

export function LandingSplashStudio({ projectSlug }: LandingSplashStudioProps) {
  const [studioData, setStudioData] = useState<ExperienceStudioPayload | null>(
    null
  );
  const [draft, setDraft] = useState<SiteExperienceConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: "SUCCESS" | "ERROR";
    text: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<StudioTab>("SECTIONS");
  const [selectedSectionId, setSelectedSectionId] =
    useState<string>("sec-01-hero");
  const [viewport, setViewport] = useState<ViewportDevice>("DESKTOP");
  const [previewSurface, setPreviewSurface] =
    useState<PreviewSurface>("LANDING");
  const [previewLocale, setPreviewLocale] = useState<"ar" | "en">("ar");
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");
  const [splashReplayKey, setSplashReplayKey] = useState<number>(1);
  const [publishNotes, setPublishNotes] = useState<string>("");

  // New Media Asset modal/inline state
  const [newAssetSlotKey, setNewAssetSlotKey] = useState<string>("");
  const [newAssetUrl, setNewAssetUrl] = useState<string>("");
  const [newAssetLabelAr, setNewAssetLabelAr] = useState<string>("");
  const [newAssetLabelEn, setNewAssetLabelEn] = useState<string>("");

  const fetchStudioData = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ mode: "studio" });
      if (projectSlug) qs.set("projectSlug", projectSlug);
      const res = await fetch(`/api/v1/experience?${qs.toString()}`);
      if (!res.ok) throw new Error("FAILED_TO_LOAD_STUDIO");
      const data: ExperienceStudioPayload = await res.json();
      setStudioData(data);
      setDraft(data.draft);
      const firstSec = data.draft.sections[0];
      if (firstSec && !selectedSectionId) {
        setSelectedSectionId(firstSec.id);
      }
    } catch (err) {
      setStatusBanner({
        type: "ERROR",
        text:
          err instanceof Error
            ? err.message
            : "تعذر تحميل بيانات استوديو الواجهة.",
      });
    } finally {
      setLoading(false);
    }
  }, [projectSlug, selectedSectionId]);

  useEffect(() => {
    fetchStudioData();
  }, [fetchStudioData]);

  const permissions: ExperiencePermission[] = studioData?.permissions ?? [
    "BRANDING_VIEW",
  ];
  const canEdit = permissions.includes("BRANDING_EDIT");
  const canPublish = permissions.includes("BRANDING_PUBLISH");
  const canManageMedia = permissions.includes("MEDIA_MANAGE");

  const sortedSections = useMemo(() => {
    if (!draft) return [];
    return [...draft.sections].sort((a, b) => a.order - b.order);
  }, [draft]);

  const selectedSection = useMemo(() => {
    return (
      sortedSections.find((s) => s.id === selectedSectionId) ??
      sortedSections[0] ??
      null
    );
  }, [sortedSections, selectedSectionId]);

  const updateSelectedSection = (
    updater: (sec: LandingSectionConfig) => LandingSectionConfig
  ) => {
    if (!draft || !selectedSection || !canEdit) return;
    setDraft({
      ...draft,
      sections: draft.sections.map((s) =>
        s.id === selectedSection.id ? updater(s) : s
      ),
    });
  };

  const handleMoveSection = (sectionId: string, direction: "UP" | "DOWN") => {
    if (!draft || !canEdit) return;
    const ordered = [...draft.sections].sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((s) => s.id === sectionId);
    if (index === -1) return;
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= ordered.length) return;

    const swapped = [...ordered];
    const currentItem = swapped[index];
    const targetItem = swapped[targetIdx];
    if (!currentItem || !targetItem) return;
    swapped[index] = targetItem;
    swapped[targetIdx] = currentItem;

    const reindexed = swapped.map((sec, idx) => ({
      ...sec,
      order: idx + 1,
    }));

    setDraft({
      ...draft,
      sections: reindexed,
    });
  };

  const handleDuplicateSection = (sec: LandingSectionConfig) => {
    if (!draft || !canEdit) return;
    const copyId = `${sec.id}-copy-${Date.now().toString().slice(-4)}`;
    const copy: LandingSectionConfig = {
      ...structuredClone(sec),
      id: copyId,
      order: draft.sections.length + 1,
      title: {
        ar: `${sec.title.ar} (نسخة)`,
        en: `${sec.title.en} (Copy)`,
      },
    };
    setDraft({
      ...draft,
      sections: [...draft.sections, copy],
    });
    setSelectedSectionId(copyId);
  };

  const handleSaveDraft = async () => {
    if (!draft || !canEdit) return;
    setSaving(true);
    setStatusBanner(null);
    try {
      const res = await fetch("/api/v1/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectSlug,
          draft,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "SAVE_FAILED");
      setStudioData(data);
      setDraft(data.draft);
      setStatusBanner({
        type: "SUCCESS",
        text: "تم حفظ المسودة وفحص معايير الجودة بنجاح.",
      });
    } catch (err) {
      setStatusBanner({
        type: "ERROR",
        text: err instanceof Error ? err.message : "فشل حفظ المسودة.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!draft || !canPublish) return;
    setPublishing(true);
    setStatusBanner(null);
    try {
      // Save current draft first so atomic publish uses latest state
      await fetch("/api/v1/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectSlug, draft }),
      });

      const res = await fetch("/api/v1/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PUBLISH",
          projectSlug,
          notes: publishNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "PUBLISH_FAILED");
      setStudioData(data);
      setDraft(data.draft);
      setPublishNotes("");
      setStatusBanner({
        type: "SUCCESS",
        text: "تم النشر الذري (Atomic Publish) وتحديث الواجهة العامة بنجاح.",
      });
    } catch (err) {
      setStatusBanner({
        type: "ERROR",
        text:
          err instanceof Error
            ? err.message
            : "تعذر النشر — تأكد من اجتياز فحص الجودة.",
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleRollback = async (versionId: string) => {
    if (!canPublish) return;
    setPublishing(true);
    setStatusBanner(null);
    try {
      const res = await fetch("/api/v1/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ROLLBACK",
          projectSlug,
          versionId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ROLLBACK_FAILED");
      setStudioData(data);
      setDraft(data.draft);
      setStatusBanner({
        type: "SUCCESS",
        text: "تمت استعادة الإصدار السابق وتفعيله مباشرة.",
      });
    } catch (err) {
      setStatusBanner({
        type: "ERROR",
        text: err instanceof Error ? err.message : "تعذر استعادة الإصدار.",
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleResetDefault = async () => {
    if (!canEdit) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESET_DEFAULT",
          projectSlug,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "RESET_FAILED");
      setStudioData(data);
      setDraft(data.draft);
      setStatusBanner({
        type: "SUCCESS",
        text: "تمت استعادة الإعدادات الافتراضية القياسية في المسودة.",
      });
    } catch (err) {
      setStatusBanner({
        type: "ERROR",
        text: err instanceof Error ? err.message : "فشل استعادة الافتراضي.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddMediaAsset = async () => {
    if (!draft || !canManageMedia || !newAssetSlotKey.trim() || !newAssetUrl.trim())
      return;
    const newAsset: MediaAssetItem = {
      id: `media-custom-${Date.now()}`,
      slotKey: newAssetSlotKey.trim(),
      label: {
        ar: newAssetLabelAr.trim() || newAssetSlotKey.trim(),
        en: newAssetLabelEn.trim() || newAssetSlotKey.trim(),
      },
      category: newAssetSlotKey.endsWith(".webm") ? "SECTION_VIDEO" : "POSTER",
      format: newAssetSlotKey.endsWith(".webm")
        ? "webm"
        : newAssetSlotKey.endsWith(".avif")
        ? "avif"
        : "webp",
      url: newAssetUrl.trim(),
      dimensions: "1920x1080",
      maxRecommendedSizeKb: 1800,
      actualSizeKb: 850,
      altText: {
        ar: newAssetLabelAr.trim() || "ملف وسائط",
        en: newAssetLabelEn.trim() || "Media asset",
      },
      isSystemDefault: false,
      updatedAt: new Date().toISOString(),
    };

    const res = await fetch("/api/v1/experience", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "UPSERT_MEDIA",
        projectSlug,
        asset: newAsset,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setStudioData(data);
      setDraft(data.draft);
      setNewAssetSlotKey("");
      setNewAssetUrl("");
      setNewAssetLabelAr("");
      setNewAssetLabelEn("");
      setStatusBanner({
        type: "SUCCESS",
        text: "تمت إضافة ملف الوسائط إلى المكتبة.",
      });
    }
  };

  const handleDeleteMediaAsset = async (assetId: string) => {
    if (!canManageMedia) return;
    const res = await fetch("/api/v1/experience", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "DELETE_MEDIA",
        projectSlug,
        assetId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatusBanner({
        type: "ERROR",
        text:
          data.error?.startsWith("MEDIA_IN_USE")
            ? `لا يمكن حذف هذا الملف لأنه مستخدم حاليًا في (${data.error.replace(
                "MEDIA_IN_USE:",
                ""
              )}).`
            : data.error || "تعذر حذف ملف الوسائط.",
      });
      return;
    }
    setStudioData(data);
    setDraft(data.draft);
    setStatusBanner({
      type: "SUCCESS",
      text: "تم حذف ملف الوسائط غير المرتبط بنجاح.",
    });
  };

  if (loading || !draft || !studioData) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[var(--accent)]" />
        <p className="mt-3 text-sm font-medium text-[var(--ink-secondary)]">
          جارٍ تحميل استوديو الواجهة وشاشة البداية (Landing &amp; Splash Studio)...
        </p>
      </div>
    );
  }

  const viewportWidthClass =
    viewport === "DESKTOP"
      ? "w-full"
      : viewport === "LAPTOP"
      ? "max-w-[1024px] mx-auto"
      : viewport === "TABLET"
      ? "max-w-[768px] mx-auto"
      : "max-w-[390px] mx-auto";

  return (
    <div className="space-y-5">
      {/* ====================================================================
          TOP STUDIO COMMAND HEADER
          ==================================================================== */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A13C]/40 bg-[#163522] px-3 py-1 font-mono text-xs font-semibold text-[#F3EACB]">
              <Sparkles className="h-3.5 w-3.5 text-[#C9A13C]" />
              LANDING &amp; SPLASH STUDIO
            </span>
            {studioData.hasUnsavedDraftDiff ? (
              <span className="rounded-full bg-[var(--warning-subtle)] px-3 py-1 text-xs font-semibold text-[var(--warning)]">
                مسودة تحتوي على تعديلات غير منشورة
              </span>
            ) : (
              <span className="rounded-full bg-[var(--success-subtle)] px-3 py-1 text-xs font-semibold text-[var(--success)]">
                متطابق مع النسخة المنشورة
              </span>
            )}
          </div>
          <h2 className="mt-2 text-lg font-semibold text-[var(--ink)]">
            استوديو تجربة الدخول وصفحة الهبوط التفاعلية
          </h2>
          <p className="text-xs text-[var(--ink-secondary)]">
            تحكم كامل في شاشة البداية السينمائية، ترتيب ومحتوى أقسام القصة البصرية، مكتبة الفيديوهات، ومعاينة النشر الفوري.
          </p>
        </div>

        {/* Action Buttons & RBAC Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefault}
            disabled={!canEdit || saving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3.5 py-2 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-hover)] disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>استعادة الافتراضي</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={!canEdit || saving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--accent)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--accent-subtle)] disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? "جارٍ الحفظ..." : "حفظ كمسودة (Draft)"}</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={!canPublish || publishing || !studioData.validation.canPublish}
            className="inline-flex items-center gap-2 rounded-xl bg-[#163522] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
            style={{ border: "1px solid #C9A13C" }}
          >
            <Send className="h-3.5 w-3.5 text-[#C9A13C]" />
            <span>
              {publishing ? "جارٍ النشر..." : "نشر التعديلات (Publish)"}
            </span>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {statusBanner && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold ${
            statusBanner.type === "SUCCESS"
              ? "border-[var(--success)]/30 bg-[var(--success-subtle)] text-[var(--success)]"
              : "border-[var(--danger)]/30 bg-[var(--danger-subtle)] text-[var(--danger)]"
          }`}
        >
          <span>{statusBanner.text}</span>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="underline"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* ====================================================================
          3-PANE STUDIO ARCHITECTURE
          Left: Controls/Tabs | Center: Live Interactive Preview | Right: Inspector
          ==================================================================== */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* ==================================================================
            LEFT PANEL (3 COLS): COMPOSER, SPLASH, TOKENS, MEDIA, SEO, VERSIONS
            ================================================================== */}
        <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] xl:col-span-3">
          {/* Studio Mode Sub-Tabs */}
          <div className="grid grid-cols-3 gap-1 border-b border-[var(--border)] p-2">
            {[
              { id: "SECTIONS", label: "الأقسام", icon: Layers },
              { id: "SPLASH", label: "البداية", icon: Sparkles },
              { id: "TOKENS", label: "الهوية", icon: Palette },
              { id: "MEDIA", label: "الوسائط", icon: Film },
              { id: "SEO", label: "SEO", icon: Search },
              { id: "VERSIONS", label: "الإصدارات", icon: History },
            ].map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as StudioTab)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-[#163522] text-white"
                      : "text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Left Panel Scrollable Content */}
          <div className="max-h-[720px] flex-1 overflow-y-auto p-4">
            {/* TAB 1: SECTION COMPOSER */}
            {activeTab === "SECTIONS" && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--ink-secondary)]">
                    التسلسل السردي للأقسام ({sortedSections.length})
                  </span>
                  <span className="font-mono text-[10px] text-[#C9A13C]">
                    Chaos → Defense
                  </span>
                </div>

                {sortedSections.map((sec, idx) => {
                  const isSelected = selectedSection?.id === sec.id;
                  return (
                    <div
                      key={sec.id}
                      onClick={() => {
                        setSelectedSectionId(sec.id);
                        setPreviewSurface("LANDING");
                      }}
                      className={`cursor-pointer rounded-xl border p-3 transition-all ${
                        isSelected
                          ? "border-[#C9A13C] bg-[#163522]/10"
                          : "border-[var(--border)] bg-[var(--surface-subtle)]/50 hover:border-[var(--border-strong)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#163522] font-mono text-[10px] font-bold text-[#DBC477]">
                            {sec.order}
                          </span>
                          <span className="truncate text-xs font-semibold text-[var(--ink)]">
                            {sec.title.ar}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={sec.enabled}
                          disabled={!canEdit}
                          onChange={(e) => {
                            e.stopPropagation();
                            setDraft({
                              ...draft,
                              sections: draft.sections.map((s) =>
                                s.id === sec.id
                                  ? { ...s, enabled: e.target.checked }
                                  : s
                              ),
                            });
                          }}
                          className="h-4 w-4 accent-[#163522]"
                          title="تفعيل أو إخفاء القسم"
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--ink-muted)]">
                        <span className="font-mono">
                          Stage {sec.narrativeStage} · {sec.type}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0 || !canEdit}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSection(sec.id, "UP");
                            }}
                            className="rounded p-1 hover:bg-[var(--surface-hover)] disabled:opacity-30"
                            title="تحريك لأعلى"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            disabled={
                              idx === sortedSections.length - 1 || !canEdit
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveSection(sec.id, "DOWN");
                            }}
                            className="rounded p-1 hover:bg-[var(--surface-hover)] disabled:opacity-30"
                            title="تحريك لأسفل"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            disabled={!canEdit}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateSection(sec);
                            }}
                            className="rounded p-1 hover:bg-[var(--surface-hover)] disabled:opacity-30"
                            title="تكرار القسم"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: SPLASH STUDIO CONTROLS */}
            {activeTab === "SPLASH" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3">
                  <div>
                    <p className="text-xs font-semibold text-[var(--ink)]">
                      تفعيل شاشة البداية السينمائية
                    </p>
                    <p className="text-[11px] text-[var(--ink-secondary)]">
                      Cinematic Entry Splash Screen
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.splash.enabled}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        splash: { ...draft.splash, enabled: e.target.checked },
                      })
                    }
                    className="h-4 w-4 accent-[#163522]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)]">
                    مدة العرض للزيارة الأولى (مللي ثانية: 4500 – 6500)
                  </label>
                  <input
                    type="number"
                    min={4200}
                    max={6500}
                    step={100}
                    value={draft.splash.firstVisitDurationMs}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        splash: {
                          ...draft.splash,
                          firstVisitDurationMs: Number(e.target.value),
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 font-mono text-xs"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3">
                  <div>
                    <p className="text-xs font-semibold text-[var(--ink)]">
                      شاشة الدخول السريعة للزيارات المتكررة (0.8s–1.4s)
                    </p>
                    <p className="text-[11px] text-[var(--ink-secondary)]">
                      Recurring Micro Splash
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.splash.recurringVisitEnabled}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        splash: {
                          ...draft.splash,
                          recurringVisitEnabled: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 accent-[#163522]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)]">
                    الرسالة الترحيبية تحت الشعار (عربي)
                  </label>
                  <input
                    type="text"
                    value={draft.splash.subheadline.ar}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        splash: {
                          ...draft.splash,
                          subheadline: {
                            ...draft.splash.subheadline,
                            ar: e.target.value,
                          },
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)]">
                    Subheadline (English)
                  </label>
                  <input
                    type="text"
                    value={draft.splash.subheadline.en}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        splash: {
                          ...draft.splash,
                          subheadline: {
                            ...draft.splash.subheadline,
                            en: e.target.value,
                          },
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs"
                  />
                </div>

                <div className="pt-2">
                  <p className="mb-2 text-xs font-semibold text-[var(--ink)]">
                    معاينة فورية لشاشة البداية:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewSurface("SPLASH_FIRST");
                        setSplashReplayKey((k) => k + 1);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#C9A13C] bg-[#163522] px-3 py-2 text-xs font-semibold text-white"
                    >
                      <Play className="h-3.5 w-3.5 text-[#C9A13C]" />
                      <span>تشغيل شاشة الزيارة الأولى (6 لقطات)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewSurface("SPLASH_RECURRING");
                        setSplashReplayKey((k) => k + 1);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs font-semibold"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#C9A13C]" />
                      <span>معاينة الزيارة المتكررة (Micro Splash)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: GLOBAL DESIGN & MOTION TOKENS */}
            {activeTab === "TOKENS" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)]">
                    السمة الافتراضية لصفحة الهبوط
                  </label>
                  <select
                    value={draft.tokens.defaultThemeMode}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        tokens: {
                          ...draft.tokens,
                          defaultThemeMode: e.target.value as
                            | "DARK"
                            | "LIGHT"
                            | "SYSTEM",
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs"
                  >
                    <option value="DARK">الوضع الداكن الفاخر (Deep Forest Dark)</option>
                    <option value="LIGHT">الوضع الفاتح الأكاديمي (Warm Ivory)</option>
                    <option value="SYSTEM">تلقائي حسب جهاز المستخدم</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)]">
                    تباعد الأقسام الرأسي (Section Vertical Spacing px)
                  </label>
                  <input
                    type="range"
                    min={72}
                    max={160}
                    step={8}
                    value={draft.tokens.sectionVerticalSpacingPx}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        tokens: {
                          ...draft.tokens,
                          sectionVerticalSpacingPx: Number(e.target.value),
                        },
                      })
                    }
                    className="mt-2 w-full accent-[#163522]"
                  />
                  <span className="font-mono text-xs text-[var(--ink-secondary)]">
                    {draft.tokens.sectionVerticalSpacingPx}px
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3">
                  <div>
                    <p className="text-xs font-semibold text-[var(--ink)]">
                      تفاعل العمق الهادئ مع المؤشر (2–7px Parallax)
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.tokens.enableParallax}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        tokens: {
                          ...draft.tokens,
                          enableParallax: e.target.checked,
                        },
                      })
                    }
                    className="h-4 w-4 accent-[#163522]"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: MEDIA LIBRARY */}
            {activeTab === "MEDIA" && (
              <div className="space-y-3">
                <p className="text-xs text-[var(--ink-secondary)]">
                  ملفات الفيديو والصور القياسية ({draft.mediaLibrary.length} ملف). الحذف محمي تلقائيًا إذا كان الملف مرتبطًا بقسم نشط.
                </p>

                {/* Add/Replace Custom Media Slot */}
                {canManageMedia && (
                  <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
                    <p className="text-xs font-semibold text-[var(--ink)]">
                      إضافة ملف وسائط جديد
                    </p>
                    <input
                      type="text"
                      placeholder="اسم المعرف (مثال: landing-custom.webm)"
                      value={newAssetSlotKey}
                      onChange={(e) => setNewAssetSlotKey(e.target.value)}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 font-mono text-xs"
                    />
                    <input
                      type="text"
                      placeholder="الرابط (/media/experience/...)"
                      value={newAssetUrl}
                      onChange={(e) => setNewAssetUrl(e.target.value)}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 font-mono text-xs"
                    />
                    <input
                      type="text"
                      placeholder="الوصف بالعربية"
                      value={newAssetLabelAr}
                      onChange={(e) => setNewAssetLabelAr(e.target.value)}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddMediaAsset}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#163522] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>إضافة للمكتبة</span>
                    </button>
                  </div>
                )}

                {draft.mediaLibrary.map((asset) => (
                  <div
                    key={asset.id}
                    className="rounded-xl border border-[var(--border)] p-3 text-xs"
                  >
                    <div className="mb-2.5 overflow-hidden rounded-lg border border-[var(--border)] bg-[#07110A]">
                      {asset.format === "mp4" || asset.format === "webm" ? (
                        <video
                          src={asset.url}
                          poster={asset.fallbackPosterUrl}
                          muted
                          loop
                          playsInline
                          controls
                          className="h-28 w-full object-cover"
                        />
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={asset.url}
                          alt={asset.altText.ar}
                          className="h-28 w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-[var(--ink)]">
                          {asset.label.ar}
                        </p>
                        <p className="font-mono text-[11px] text-[#C9A13C]">
                          {asset.slotKey}
                        </p>
                      </div>
                      {!asset.isSystemDefault && canManageMedia && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMediaAsset(asset.id)}
                          className="rounded p-1 text-[var(--danger)] hover:bg-[var(--danger-subtle)]"
                          title="حذف الملف"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[10px] text-[var(--ink-muted)]">
                      <span>{asset.format.toUpperCase()}</span>
                      <span>·</span>
                      <span>{asset.dimensions}</span>
                      <span>·</span>
                      <span>
                        {asset.actualSizeKb}KB / {asset.maxRecommendedSizeKb}KB
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 5: SEO & SOCIAL PREVIEW */}
            {activeTab === "SEO" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)]">
                    عنوان الصفحة (SEO Title - عربي)
                  </label>
                  <input
                    type="text"
                    value={draft.seo.title.ar}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        seo: {
                          ...draft.seo,
                          title: { ...draft.seo.title, ar: e.target.value },
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)]">
                    SEO Title (English)
                  </label>
                  <input
                    type="text"
                    value={draft.seo.title.en}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        seo: {
                          ...draft.seo,
                          title: { ...draft.seo.title, en: e.target.value },
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ink)]">
                    الوصف التعريفي (Meta Description - عربي)
                  </label>
                  <textarea
                    rows={3}
                    value={draft.seo.description.ar}
                    disabled={!canEdit}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        seo: {
                          ...draft.seo,
                          description: {
                            ...draft.seo.description,
                            ar: e.target.value,
                          },
                        },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-2.5 text-xs"
                  />
                </div>

                {/* Live OpenGraph Social Card Preview */}
                <div className="rounded-xl border border-[#203728] bg-[#08110B] p-3 text-[#F2F4F1]">
                  <span className="font-mono text-[10px] uppercase text-[#C9A13C]">
                    SOCIAL SHARE PREVIEW (OPENGRAPH)
                  </span>
                  <p className="mt-1.5 text-xs font-semibold">
                    {draft.seo.title.ar}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] text-[#9AA99E]">
                    {draft.seo.description.ar}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 6: VERSIONS, QUALITY GATE & ROLLBACK */}
            {activeTab === "VERSIONS" && (
              <div className="space-y-4">
                {/* Pre-Publish Quality Gate */}
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--ink)]">
                      بوابة فحص الجودة قبل النشر
                    </span>
                    {studioData.validation.canPublish ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--success)]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        جاهز للنشر
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--danger)]">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        يوجد أخطاء تمنع النشر
                      </span>
                    )}
                  </div>

                  {studioData.validation.errors.map((err, i) => (
                    <p
                      key={i}
                      className="mt-2 rounded bg-[var(--danger-subtle)] p-2 text-[11px] text-[var(--danger)]"
                    >
                      {err.message.ar}
                    </p>
                  ))}

                  {studioData.validation.warnings.map((warn, i) => (
                    <p
                      key={i}
                      className="mt-2 rounded bg-[var(--warning-subtle)] p-2 text-[11px] text-[var(--warning)]"
                    >
                      {warn.message.ar}
                    </p>
                  ))}
                </div>

                {/* Release Notes Input */}
                {canPublish && (
                  <div>
                    <label className="block text-xs font-semibold text-[var(--ink)]">
                      ملاحظات الإصدار الجديد (عند النشر)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: تحديث عنوان المشهد الرئيسي..."
                      value={publishNotes}
                      onChange={(e) => setPublishNotes(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs"
                    />
                  </div>
                )}

                {/* Version History List */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[var(--ink-secondary)]">
                    سجل الإصدارات المنشورة ({studioData.versions.length})
                  </span>
                  {studioData.versions.map((ver, idx) => (
                    <div
                      key={ver.versionId}
                      className="rounded-xl border border-[var(--border)] p-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[var(--ink)]">
                          {ver.label}
                        </span>
                        {idx === 0 && (
                          <span className="rounded-full bg-[#163522] px-2 py-0.5 font-mono text-[10px] text-[#DBC477]">
                            LIVE
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-[var(--ink-muted)]">
                        بواسطة {ver.publishedByName} ·{" "}
                        {new Date(ver.publishedAt).toLocaleDateString("ar-EG")}
                      </p>
                      {idx > 0 && canPublish && (
                        <button
                          type="button"
                          onClick={() => handleRollback(ver.versionId)}
                          className="mt-2 inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1 text-[11px] font-semibold hover:bg-[var(--surface-subtle)]"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>استعادة هذا الإصدار (Rollback)</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================
            CENTER PANEL (6 COLS): LIVE INTERACTIVE PREVIEW STAGE
            ================================================================== */}
        <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] xl:col-span-6">
          {/* Preview Viewport & Surface Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] p-3">
            {/* Surface Switcher */}
            <div className="flex items-center gap-1 rounded-xl bg-[var(--surface-subtle)] p-1">
              <button
                type="button"
                onClick={() => setPreviewSurface("LANDING")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  previewSurface === "LANDING"
                    ? "bg-[#163522] text-white"
                    : "text-[var(--ink-secondary)]"
                }`}
              >
                صفحة الهبوط
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewSurface("SPLASH_FIRST");
                  setSplashReplayKey((k) => k + 1);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  previewSurface === "SPLASH_FIRST"
                    ? "bg-[#163522] text-white"
                    : "text-[var(--ink-secondary)]"
                }`}
              >
                Splash (أول زيارة)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewSurface("SPLASH_RECURRING");
                  setSplashReplayKey((k) => k + 1);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  previewSurface === "SPLASH_RECURRING"
                    ? "bg-[#163522] text-white"
                    : "text-[var(--ink-secondary)]"
                }`}
              >
                Micro Splash
              </button>
            </div>

            {/* Device Viewport + RTL/LTR + Theme Controls */}
            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: "DESKTOP", icon: Monitor, title: "Desktop" },
                  { id: "LAPTOP", icon: Laptop, title: "Laptop" },
                  { id: "TABLET", icon: Tablet, title: "Tablet" },
                  { id: "MOBILE", icon: Smartphone, title: "Mobile" },
                ] as const
              ).map((dev) => {
                const Icon = dev.icon;
                return (
                  <button
                    key={dev.id}
                    type="button"
                    onClick={() => setViewport(dev.id)}
                    className={`rounded-lg p-1.5 ${
                      viewport === dev.id
                        ? "bg-[#163522] text-[#C9A13C]"
                        : "text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)]"
                    }`}
                    title={dev.title}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  setPreviewLocale((l) => (l === "ar" ? "en" : "ar"))
                }
                className="rounded-lg border border-[var(--border)] px-2 py-1 font-mono text-xs font-semibold"
              >
                {previewLocale === "ar" ? "RTL · عربي" : "LTR · EN"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setPreviewTheme((t) => (t === "dark" ? "light" : "dark"))
                }
                className="rounded-lg border border-[var(--border)] p-1.5"
              >
                {previewTheme === "dark" ? (
                  <Sun className="h-3.5 w-3.5 text-[#C9A13C]" />
                ) : (
                  <Moon className="h-3.5 w-3.5 text-[#163522]" />
                )}
              </button>
            </div>
          </div>

          {/* Live Interactive Preview Container */}
          <div className="max-h-[720px] flex-1 overflow-y-auto bg-[#050B07] p-3">
            <div
              className={`${viewportWidthClass} overflow-hidden rounded-xl border border-[#203728] shadow-2xl transition-all duration-300`}
            >
              {previewSurface === "LANDING" ? (
                <CinematicLandingPage
                  config={draft}
                  initialLocale={previewLocale}
                  initialTheme={previewTheme}
                  isStudioPreview={true}
                  selectedSectionId={selectedSection?.id ?? null}
                  onSelectSection={(secId) => {
                    setSelectedSectionId(secId);
                    setActiveTab("SECTIONS");
                  }}
                />
              ) : (
                <CinematicSplash
                  key={splashReplayKey}
                  config={draft.splash}
                  mediaLibrary={draft.mediaLibrary}
                  locale={previewLocale}
                  studioPreviewMode={
                    previewSurface === "SPLASH_FIRST"
                      ? "FIRST_VISIT"
                      : previewSurface === "SPLASH_RECURRING"
                      ? "RECURRING"
                      : "STATIC_FALLBACK"
                  }
                />
              )}
            </div>
          </div>
        </div>

        {/* ==================================================================
            RIGHT PANEL (3 COLS): SECTION & PROPERTY INSPECTOR
            ================================================================== */}
        <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] xl:col-span-3">
          <div className="border-b border-[var(--border)] p-4">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#C9A13C]">
              SECTION INSPECTOR
            </span>
            <h3 className="mt-1 text-sm font-semibold text-[var(--ink)]">
              {selectedSection
                ? `خصائص القسم #${selectedSection.order} (${selectedSection.type})`
                : "اختر قسمًا لتحرير خصائصه"}
            </h3>
          </div>

          {selectedSection && (
            <div className="max-h-[720px] flex-1 space-y-4 overflow-y-auto p-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--ink)]">
                  الشارة العلوية (Eyebrow - عربي)
                </label>
                <input
                  type="text"
                  value={selectedSection.eyebrow.ar}
                  disabled={!canEdit}
                  onChange={(e) =>
                    updateSelectedSection((s) => ({
                      ...s,
                      eyebrow: { ...s.eyebrow, ar: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink)]">
                  Eyebrow (English)
                </label>
                <input
                  type="text"
                  value={selectedSection.eyebrow.en}
                  disabled={!canEdit}
                  onChange={(e) =>
                    updateSelectedSection((s) => ({
                      ...s,
                      eyebrow: { ...s.eyebrow, en: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink)]">
                  العنوان الرئيسي للقسم (عربي)
                </label>
                <textarea
                  rows={2}
                  value={selectedSection.title.ar}
                  disabled={!canEdit}
                  onChange={(e) =>
                    updateSelectedSection((s) => ({
                      ...s,
                      title: { ...s.title, ar: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-2.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink)]">
                  Headline (English)
                </label>
                <textarea
                  rows={2}
                  value={selectedSection.title.en}
                  disabled={!canEdit}
                  onChange={(e) =>
                    updateSelectedSection((s) => ({
                      ...s,
                      title: { ...s.title, en: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-2.5 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink)]">
                  الوصف التفصيلي (عربي)
                </label>
                <textarea
                  rows={3}
                  value={selectedSection.subtitle.ar}
                  disabled={!canEdit}
                  onChange={(e) =>
                    updateSelectedSection((s) => ({
                      ...s,
                      subtitle: { ...s.subtitle, ar: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink)]">
                  Subtitle (English)
                </label>
                <textarea
                  rows={3}
                  value={selectedSection.subtitle.en}
                  disabled={!canEdit}
                  onChange={(e) =>
                    updateSelectedSection((s) => ({
                      ...s,
                      subtitle: { ...s.subtitle, en: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink)]">
                  نمط الخلفية (Background Surface Mode)
                </label>
                <select
                  value={selectedSection.backgroundMode}
                  disabled={!canEdit}
                  onChange={(e) =>
                    updateSelectedSection((s) => ({
                      ...s,
                      backgroundMode:
                        e.target.value as LandingSectionConfig["backgroundMode"],
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs"
                >
                  <option value="DARK_FOREST">أخضر غابي داكن (#08110B)</option>
                  <option value="FOREST_ELEVATED">أخضر معماري مرتفع (#0D1C11)</option>
                  <option value="WARM_IVORY">عاجي دافئ (Warm Ivory #F6F5F1)</option>
                  <option value="AUTO_THEME">تلقائي مع سمة الصفحة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink)]">
                  مستوى الحركة السينمائية (Motion Intensity)
                </label>
                <select
                  value={selectedSection.motionIntensity}
                  disabled={!canEdit}
                  onChange={(e) =>
                    updateSelectedSection((s) => ({
                      ...s,
                      motionIntensity:
                        e.target.value as LandingSectionConfig["motionIntensity"],
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs"
                >
                  <option value="CINEMATIC">سينمائي كامل (Cinematic)</option>
                  <option value="BALANCED">متوازن (Balanced)</option>
                  <option value="LOW">هادئ / منخفض (Low Motion)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink)]">
                  ملف الفيديو المرتبط بالقسم (Video Slot)
                </label>
                <select
                  value={selectedSection.videoSlotId ?? ""}
                  disabled={!canEdit}
                  onChange={(e) =>
                    updateSelectedSection((s) => ({
                      ...s,
                      videoSlotId: e.target.value || undefined,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 font-mono text-xs"
                >
                  <option value="">مشهد تفاعلي مباشر (بدون فيديو منفصل)</option>
                  {draft.mediaLibrary
                    .filter((m) => m.format === "webm" || m.format === "mp4")
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.slotKey}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ink)]">
                  صورة المشهد / الغلاف للقسم (Poster / Scene Image Slot)
                </label>
                <select
                  value={selectedSection.posterSlotId ?? ""}
                  disabled={!canEdit}
                  onChange={(e) =>
                    updateSelectedSection((s) => ({
                      ...s,
                      posterSlotId: e.target.value || undefined,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 font-mono text-xs"
                >
                  <option value="">افتراضي</option>
                  {draft.mediaLibrary
                    .filter((m) => m.format !== "webm" && m.format !== "mp4")
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.slotKey} — {m.label.ar}
                      </option>
                    ))}
                </select>

                {selectedSection.posterSlotId &&
                  (() => {
                    const boundPoster = draft.mediaLibrary.find(
                      (m) => m.id === selectedSection.posterSlotId
                    );
                    if (!boundPoster) return null;
                    return (
                      <div className="mt-2 overflow-hidden rounded-lg border border-[var(--border)] bg-[#07110A]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={boundPoster.url}
                          alt={boundPoster.altText.ar}
                          className="h-28 w-full object-cover"
                        />
                      </div>
                    );
                  })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
