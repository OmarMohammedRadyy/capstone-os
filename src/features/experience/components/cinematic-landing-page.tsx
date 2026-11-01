"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LandingSectionConfig,
  MediaAssetItem,
  SiteExperienceConfig,
} from "../types/experience-types";
import { CinematicSplash } from "./cinematic-splash";
import { trackExperienceEvent } from "../analytics/experience-analytics";
import {
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  Clock,
  Compass,
  Cpu,
  FileCheck2,
  FileText,
  Film,
  Globe,
  Layers,
  MessageSquare,
  Moon,
  PackageCheck,
  PenTool,
  Play,
  Presentation,
  RefreshCw,
  Sliders,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";

export interface CinematicLandingPageProps {
  config: SiteExperienceConfig;
  initialLocale?: "ar" | "en";
  initialTheme?: "dark" | "light";
  userContext?: {
    isAuthenticated: boolean;
    fullName?: string;
    attentionTasksCount?: number;
    hasUpcomingMilestone?: boolean;
  };
  /** When rendered inside the Landing & Splash Studio live preview */
  isStudioPreview?: boolean;
  selectedSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
}

const ROADMAP_STATIONS = [
  {
    id: "st-idea",
    step: "01",
    ar: "الفكرة والنطاق",
    en: "Idea & Scope",
    descAr: "صياغة المشكلة البحثية وتحديد الأهداف والجدوى الهندسية.",
    descEn: "Problem statement formulation, objectives, and engineering feasibility.",
    deliverableAr: "ميثاق المشروع (Project Charter)",
    deliverableEn: "Project Charter v1",
  },
  {
    id: "st-research",
    step: "02",
    ar: "المسح المرجعي",
    en: "Literature & Research",
    descAr: "مراجعة الأبحاث السابقة والمقارنة المنهجية للحلول.",
    descEn: "Systematic literature review and comparative technical analysis.",
    deliverableAr: "فصل الدراسات السابقة",
    deliverableEn: "Literature Matrix",
  },
  {
    id: "st-planning",
    step: "03",
    ar: "التخطيط والهيكلة",
    en: "Planning & Milestones",
    descAr: "تقسيم المشروع إلى مراحل (Milestones) ودورات عمل (Sprints).",
    descEn: "Decomposing scope into gated Milestones and 2-week Sprints.",
    deliverableAr: "خارطة المراحل والجدول الزمني",
    deliverableEn: "Milestone Roadmap",
  },
  {
    id: "st-design",
    step: "04",
    ar: "التصميم المعماري",
    en: "System Architecture",
    descAr: "بناء مخططات النظام، قاعدة البيانات، وواجهات البرمجة.",
    descEn: "Entity schemas, system topology, and interface specifications.",
    deliverableAr: "وثيقة التصميم المعماري (SDD)",
    deliverableEn: "Architecture Spec (SDD)",
  },
  {
    id: "st-dev",
    step: "05",
    ar: "التطوير والتنفيذ",
    en: "Development",
    descAr: "تنفيذ المهام البرمجية والهندسية وربطها بمراجعات المشرف.",
    descEn: "Sprint execution, code integration, and continuous supervisor reviews.",
    deliverableAr: "النموذج الأولي المتكامل (MVP)",
    deliverableEn: "Working Prototype",
  },
  {
    id: "st-testing",
    step: "06",
    ar: "الاختبار والتحقق",
    en: "Testing & QA",
    descAr: "اختبارات الأداء، معالجة المخاطر، والتحقق من معايير القبول.",
    descEn: "Benchmarking, risk mitigation, and acceptance criteria verification.",
    deliverableAr: "تقرير الفحص والجودة",
    deliverableEn: "Verification Report",
  },
  {
    id: "st-submission",
    step: "07",
    ar: "حزمة التسليم",
    en: "Submission Package",
    descAr: "تجميع التقرير النهائي، الشيفرة المصدرية، وموافقة المشرف.",
    descEn: "Sealing Final Report v8, source archive, and supervisor sign-off.",
    deliverableAr: "حزمة التسليم المعتمدة (SHA-256)",
    deliverableEn: "Sealed Release Package",
  },
  {
    id: "st-defense",
    step: "08",
    ar: "المناقشة النهائية",
    en: "Final Defense",
    descAr: "توزيع أدوار العرض التقديمي والاستعداد الكامل للجنة التحكيم.",
    descEn: "Speaker slots, Q&A readiness bank, and committee evaluation.",
    deliverableAr: "جاهزية المناقشة 94%",
    deliverableEn: "Defense Ready 94%",
  },
];

const UNIVERSE_ORBITS = [
  {
    id: "orb-planning",
    ar: "التخطيط والمراحل",
    en: "Planning",
    roleAr: "يربط الهدف العام بالمراحل والدورات الزمنية ومعايير القبول.",
    roleEn: "Connects project goals to gated milestones, sprints, and acceptance criteria.",
    metric: "4 Milestones · 8 Sprints",
    icon: Compass,
  },
  {
    id: "orb-tasks",
    ar: "إدارة المهام",
    en: "Tasks",
    roleAr: "بطاقات تنفيذية مرتبطة بالمسؤول، الأولوية، وقوائم الفحص.",
    roleEn: "Execution cards bound to assignees, checklists, and dependencies.",
    metric: "42 Active Tasks",
    icon: CheckSquare,
  },
  {
    id: "orb-team",
    ar: "الفريق والأدوار",
    en: "Team",
    roleAr: "توزيع واضح للمسؤوليات بين القائد، الأعضاء، والمشرف الأكاديمي.",
    roleEn: "Clear accountability across Team Leader, Students, and Supervisors.",
    metric: "5 Members · 1 Supervisor",
    icon: Users,
  },
  {
    id: "orb-academic",
    ar: "الإشراف الأكاديمي",
    en: "Academic",
    roleAr: "تحويل الاجتماعات وملاحظات المشرف إلى قرارات ومهام ملموسة.",
    roleEn: "Turns supervisor feedback and meetings into tracked engineering actions.",
    metric: "100% Feedback Tracked",
    icon: PenTool,
  },
  {
    id: "orb-documents",
    ar: "مستودع الوثائق",
    en: "Documents",
    roleAr: "إدارة الإصدارات المتعاقبة للتقرير النهائي والعروض ببصمة SHA-256.",
    roleEn: "Version-controlled repository with SHA-256 integrity verification.",
    metric: "Version 8 Locked",
    icon: FileText,
  },
  {
    id: "orb-health",
    ar: "صحة المشروع",
    en: "Health",
    roleAr: "قياس شفاف لتقدم المشروع وتأثير التأخيرات والمخاطر.",
    roleEn: "Transparent diagnostic score across velocity, risks, and documentation.",
    metric: "Score 78 / 100",
    icon: Sliders,
  },
  {
    id: "orb-submissions",
    ar: "التسليمات الرسمية",
    en: "Submissions",
    roleAr: "حزم تسليم رسمية موثقة ومرتبطة بموافقة المشرف الأكاديمي.",
    roleEn: "Formal milestone submission packages with academic approval workflows.",
    metric: "3 Approved Packages",
    icon: PackageCheck,
  },
  {
    id: "orb-defense",
    ar: "مركز المناقشة",
    en: "Defense",
    roleAr: "تجهيز العرض النهائي، توزيع المتحدثين، وبنك أسئلة اللجنة.",
    roleEn: "Final presentation room checklist, speaker timing, and Q&A readiness.",
    metric: "Defense Ready 94%",
    icon: Presentation,
  },
];

export function CinematicLandingPage({
  config,
  initialLocale = "ar",
  initialTheme,
  userContext,
  isStudioPreview = false,
  selectedSectionId = null,
  onSelectSection,
}: CinematicLandingPageProps) {
  const [locale, setLocale] = useState<"ar" | "en">(initialLocale);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (initialTheme) return initialTheme;
    return config.tokens.defaultThemeMode === "LIGHT" ? "light" : "dark";
  });
  const [splashDone, setSplashDone] = useState<boolean>(isStudioPreview);

  // Interactive states for storytelling sections
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [heroViewMode, setHeroViewMode] = useState<"VIDEO" | "INTERACTIVE">(
    "VIDEO"
  );
  const [heroStructured, setHeroStructured] = useState<boolean>(true);
  const [chaosResolved, setChaosResolved] = useState<boolean>(true);
  const [activeStationIdx, setActiveStationIdx] = useState<number>(3);
  const [activeOrbitIdx, setActiveOrbitIdx] = useState<number>(0);
  const [executionStep, setExecutionStep] = useState<0 | 1 | 2 | 3>(2);
  const [meetingMorphStep, setMeetingMorphStep] = useState<0 | 1 | 2>(2);
  const [feedbackStep, setFeedbackStep] = useState<
    "ANNOTATE" | "ASSIGN" | "RESOLVE"
  >("ASSIGN");
  const [docsCollapsed, setDocsCollapsed] = useState<boolean>(true);
  const [activeContinuityNode, setActiveContinuityNode] = useState<number>(2);

  useEffect(() => {
    setLocale(initialLocale);
  }, [initialLocale]);

  useEffect(() => {
    if (initialTheme) {
      setTheme(initialTheme);
    }
  }, [initialTheme]);

  useEffect(() => {
    trackExperienceEvent("landing_view", { isStudioPreview }, locale);
  }, [isStudioPreview, locale]);

  const handleSplashComplete = React.useCallback(() => {
    setSplashDone(true);
  }, []);

  useEffect(() => {
    if (!splashDone) return;
    const interval = setInterval(() => {
      setExecutionStep((prev) => ((prev + 1) % 4) as 0 | 1 | 2 | 3);
    }, 3400);
    return () => clearInterval(interval);
  }, [splashDone]);

  const isRtl = locale === "ar";
  const isDark = theme === "dark";

  const enabledSections = useMemo(
    () =>
      [...config.sections]
        .filter((s) => s.enabled)
        .sort((a, b) => a.order - b.order),
    [config.sections]
  );

  const resolveMedia = (
    slotId: string | undefined,
    fallbackUrl: string
  ): { url: string; alt: string; asset?: MediaAssetItem } => {
    if (!slotId) return { url: fallbackUrl, alt: "SVA-DUATE Visual" };
    const found = config.mediaLibrary.find((m) => m.id === slotId);
    if (!found) return { url: fallbackUrl, alt: "SVA-DUATE Visual" };
    return {
      url: found.url || fallbackUrl,
      alt: found.altText[locale] || found.label[locale],
      asset: found,
    };
  };

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!config.tokens.enableParallax) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({
      x: Math.round(nx * 10),
      y: Math.round(ny * 8),
    });
  };

  const getSectionPalette = (sec: LandingSectionConfig) => {
    // Ink & Bone — a printed academic edition. Dark = ink, Light = bone paper.
    if (isDark) {
      if (sec.backgroundMode === "FOREST_ELEVATED") {
        return {
          bg: "#0F1511",
          surface: "#131B16",
          elevated: "#18221B",
          border: "#253229",
          text: "#ECE8DD",
          subtext: "#979C90",
          isSectionDark: true,
        };
      }
      if (sec.backgroundMode === "WARM_IVORY") {
        return {
          bg: "#0D120F",
          surface: "#121914",
          elevated: "#172019",
          border: "#222D25",
          text: "#ECE8DD",
          subtext: "#979C90",
          isSectionDark: true,
        };
      }
      return {
        bg: "#0B0F0C",
        surface: "#101612",
        elevated: "#151D17",
        border: "#1F2A22",
        text: "#ECE8DD",
        subtext: "#979C90",
        isSectionDark: true,
      };
    }

    // Light Mode — bone paper, ink type, gold-leaf hairlines
    if (sec.backgroundMode === "FOREST_ELEVATED") {
      return {
        bg: "#EAE5D8",
        surface: "#F7F4EC",
        elevated: "#E1DBCC",
        border: "#CFC7B4",
        text: "#15140F",
        subtext: "#5A5A4E",
        isSectionDark: false,
      };
    }
    if (sec.backgroundMode === "DARK_FOREST") {
      return {
        bg: "#F1EDE3",
        surface: "#FAF8F2",
        elevated: "#E8E2D5",
        border: "#D6CEBC",
        text: "#15140F",
        subtext: "#5E5E52",
        isSectionDark: false,
      };
    }
    return {
      bg: "#F6F3EB",
      surface: "#FFFDF8",
      elevated: "#ECE7DB",
      border: "#DCD5C4",
      text: "#15140F",
      subtext: "#626256",
      isSectionDark: false,
    };
  };

  const [scrollProgress, setScrollProgress] = useState<number>(0);
  useEffect(() => {
    if (isStudioPreview) return;
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setScrollProgress(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isStudioPreview]);

  useEffect(() => {
    if (isStudioPreview || typeof IntersectionObserver === "undefined") return;
    const nodes = document.querySelectorAll<HTMLElement>("[data-sva-section]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.06 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [isStudioPreview, enabledSections.length, splashDone]);

  const ink = isDark ? "#ECE8DD" : "#15140F";
  const leaf = "#BF9A4A";
  const toRoman = (n: number) =>
    ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII"][n] ?? String(n);

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      data-sva-theme={theme}
      data-preview={isStudioPreview ? "1" : undefined}
      className="sva-x min-h-screen w-full"
      style={{
        backgroundColor: isDark ? "#0B0F0C" : "#F1EDE3",
        color: ink,
      }}
    >
      {/* ====================================================================
          CINEMATIC SPLASH / RECURRING MICRO-SPLASH OVERLAY
          ==================================================================== */}
      {!isStudioPreview && !splashDone && (
        <CinematicSplash
          config={config.splash}
          mediaLibrary={config.mediaLibrary}
          locale={locale}
          userContext={userContext}
          onComplete={handleSplashComplete}
        />
      )}

      {/* ====================================================================
          00. MASTHEAD
          ==================================================================== */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-[6px] transition-colors"
        style={{
          backgroundColor: isDark
            ? "rgba(11, 15, 12, 0.86)"
            : "rgba(241, 237, 227, 0.88)",
          borderColor: isDark ? "#1F2A22" : "#D6CEBC",
        }}
      >
        {/* Dateline strip */}
        <div
          className="hidden border-b md:block"
          style={{ borderColor: isDark ? "#1A231D" : "#E0D9C9" }}
        >
          <div
            className="mx-auto flex h-7 max-w-7xl items-center justify-between px-4 font-mono text-[10px] uppercase tracking-[0.26em] sm:px-6 lg:px-8"
            style={{ color: isDark ? "#7E8478" : "#7A7766" }}
          >
            <span>
              {isRtl
                ? "منصة إدارة مشاريع التخرج · إصدار ٢٠٢٦"
                : "Graduation Project Operating System · Edition 2026"}
            </span>
            <span className="flex items-center gap-4">
              <span>
                {isRtl ? "للفرق · للمشرفين · للجان" : "Teams · Supervisors · Committees"}
              </span>
              <span style={{ color: leaf }}>№ 01</span>
            </span>
          </div>
        </div>

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-[#BF9A4A]"
          >
            <Image
              src="/brand/logo.png"
              alt="SVA-DUATE Official Logo"
              width={34}
              height={34}
              unoptimized
              className="h-9 w-9 object-contain"
              priority
            />
            <span
              dir="ltr"
              className="text-[1.45rem] leading-none"
              style={{
                fontFamily: "var(--sva-display-latin)",
                letterSpacing: "-0.02em",
              }}
            >
              SVA<span className="italic" style={{ color: leaf }}>—duate</span>
            </span>
          </Link>

          <nav
            aria-label={isRtl ? "روابط الصفحة الرئيسية" : "Primary Navigation"}
            className="hidden items-center gap-8 text-[13px] font-medium lg:flex"
          >
            {[
              { href: "#sec-04-universe", ar: "النظام", en: "Product" },
              { href: "#sec-03-journey", ar: "مسار العمل", en: "Workflow" },
              { href: "#sec-10-health", ar: "صحة المشروع", en: "Health" },
              { href: "#sec-14-defense", ar: "المناقشة", en: "Defense" },
            ].map((l, i) => (
              <a key={l.href} href={l.href} className="sva-nav-link">
                <small>0{i + 1}</small>
                <span>{isRtl ? l.ar : l.en}</span>
              </a>
            ))}
            <Link
              href={userContext?.isAuthenticated ? "/app" : "/login"}
              className="sva-nav-link"
            >
              <small>05</small>
              <span>{isRtl ? "الدليل" : "Guide"}</span>
            </Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <div
              className="flex items-center font-mono text-[11px] uppercase tracking-[0.18em]"
              style={{ color: isDark ? "#7E8478" : "#7A7766" }}
            >
              <button
                type="button"
                onClick={() => setLocale((prev) => (prev === "ar" ? "en" : "ar"))}
                className="px-2 py-2 transition-colors hover:text-[#BF9A4A]"
                title={isRtl ? "Switch to English" : "التبديل للعربية"}
              >
                <span style={{ color: isRtl ? ink : undefined }}>ع</span>
                <span className="mx-1.5 opacity-50">/</span>
                <span style={{ color: !isRtl ? ink : undefined }}>EN</span>
              </button>

              <span className="h-4 w-px" style={{ backgroundColor: isDark ? "#253229" : "#D6CEBC" }} />

              <button
                type="button"
                onClick={() => {
                  setTheme((prev) => {
                    const next = prev === "dark" ? "light" : "dark";
                    if (typeof document !== "undefined") {
                      document.documentElement.classList.toggle(
                        "dark",
                        next === "dark"
                      );
                      document.cookie = `capstone_theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
                    }
                    return next;
                  });
                }}
                className="inline-flex items-center gap-1.5 px-2 py-2 transition-colors hover:text-[#BF9A4A]"
                aria-label={isRtl ? "تبديل المظهر" : "Toggle theme"}
              >
                {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">
                  {isDark ? (isRtl ? "فاتح" : "Paper") : isRtl ? "داكن" : "Ink"}
                </span>
              </button>
            </div>

            <Link
              href={userContext?.isAuthenticated ? "/app" : "/login"}
              onClick={() =>
                trackExperienceEvent("login_clicked", { nav: true }, locale)
              }
              className="sva-link-underline hidden text-[13px] font-medium sm:inline"
            >
              {userContext?.isAuthenticated
                ? isRtl
                  ? "مساحة العمل"
                  : "Workspace"
                : isRtl
                ? "تسجيل الدخول"
                : "Sign in"}
            </Link>

            <Link
              href={userContext?.isAuthenticated ? "/app" : "/login"}
              onClick={() =>
                trackExperienceEvent(
                  "start_project_clicked",
                  { location: "navbar" },
                  locale
                )
              }
              className="sva-btn h-10 text-[13px]"
              style={{
                backgroundColor: ink,
                color: isDark ? "#0B0F0C" : "#F1EDE3",
              }}
            >
              <span className="sva-btn-label">
                {isRtl ? "ابدأ مشروعك" : "Start a project"}
              </span>
              <span className="sva-btn-tile">
                <ArrowRight className="h-3.5 w-3.5" style={{ color: leaf }} />
              </span>
            </Link>
          </div>
        </div>
        {!isStudioPreview && (
          <span
            className="sva-progress"
            style={{ width: `${scrollProgress}%` }}
            aria-hidden="true"
          />
        )}
      </header>

      {/* ====================================================================
          CONTINUOUS VISUAL STORYTELLING SECTIONS (01 .. 16)
          ==================================================================== */}
      <main>
        {enabledSections.map((sec, secIdx) => {
          const palette = getSectionPalette(sec);
          const isSelectedInStudio =
            isStudioPreview && selectedSectionId === sec.id;
          const folioNum = String(secIdx + 1).padStart(2, "0");
          const folioTotal = String(enabledSections.length).padStart(2, "0");

          return (
            <React.Fragment key={sec.id}>
            <section
              id={sec.id}
              data-sva-section=""
              onClick={() => {
                if (isStudioPreview && onSelectSection) {
                  onSelectSection(sec.id);
                }
              }}
              className={`relative overflow-hidden border-b transition-colors ${
                isStudioPreview ? "cursor-pointer" : ""
              }`}
              style={{
                backgroundColor: palette.bg,
                borderColor: palette.border,
                color: palette.text,
                paddingTop: `${Math.round(
                  config.tokens.sectionVerticalSpacingPx * 0.75
                ) + (sec.type === "HERO" ? 8 : 40)}px`,
                paddingBottom: `${Math.round(
                  config.tokens.sectionVerticalSpacingPx * 0.75
                )}px`,
                outline: isSelectedInStudio ? "2px solid #BF9A4A" : undefined,
                outlineOffset: isSelectedInStudio ? "-2px" : undefined,
              }}
            >
              {isStudioPreview && (
                <div className="pointer-events-none absolute top-3 end-3 z-30 flex items-center gap-2 border border-[#BF9A4A]/40 bg-[#0B0F0C]/90 px-3 py-1 text-[11px] font-mono text-[#DBC477]">
                  <span>#{sec.order}</span>
                  <span>·</span>
                  <span>{sec.type}</span>
                </div>
              )}

              {/* Folio: running head of the edition */}
              {sec.type !== "HERO" && (
                <div className="sva-folio" aria-hidden="true">
                  <div className="sva-folio-inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <span className="sva-folio-num">§ {folioNum}</span>
                    <span className="sva-folio-rule" />
                    <span>
                      {toRoman(secIdx + 1)} / {toRoman(enabledSections.length)}
                    </span>
                    <span className="hidden sm:inline">
                      {folioNum} — {folioTotal}
                    </span>
                  </div>
                </div>
              )}

              <div className="sva-reveal mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* ==========================================================
                    SECTION 01: CINEMATIC HERO (REAL 3D VIDEO + INTERACTIVE STAGE)
                    ========================================================== */}
                {sec.type === "HERO" &&
                  (() => {
                    const heroVideo = resolveMedia(
                      sec.videoSlotId,
                      "/media/experience/landing-hero-chaos-desktop.mp4"
                    );
                    const heroPoster = resolveMedia(
                      sec.posterSlotId,
                      "/media/experience/landing-hero-poster.jpg"
                    );

                    return (
                      <div
                        onMouseMove={handleHeroMouseMove}
                        className="grid grid-cols-1 items-end gap-14 lg:grid-cols-12 lg:pt-6"
                      >
                        <div className="lg:col-span-7">
                          {/* Edition line */}
                          <div className="flex items-center gap-4">
                            <span
                              className="font-mono text-[10px] uppercase tracking-[0.3em]"
                              style={{ color: palette.subtext }}
                            >
                              {isRtl ? "المجلد الأول" : "Vol. I"}
                            </span>
                            <span
                              className="h-px w-10"
                              style={{ backgroundColor: palette.border }}
                            />
                            <span className="sva-eyebrow">
                              {sec.eyebrow[locale]}
                            </span>
                          </div>

                          <h1
                            className="mt-8"
                            style={{
                              fontSize: isRtl
                                ? `clamp(2.6rem, 5.4vw, ${
                                    4.9 * config.tokens.headingScaleMultiplier
                                  }rem)`
                                : `clamp(3rem, 6.6vw, ${
                                    6.1 * config.tokens.headingScaleMultiplier
                                  }rem)`,
                              lineHeight: isRtl ? 1.32 : 0.98,
                              textWrap: "balance",
                            }}
                          >
                            {sec.title[locale]}
                          </h1>

                          <div className="mt-8 grid grid-cols-12 gap-4">
                            <span
                              className="col-span-1 mt-3 hidden h-px sm:block"
                              style={{ backgroundColor: leaf }}
                            />
                            <p
                              className="col-span-12 max-w-xl text-base leading-[1.85] sm:col-span-11 sm:text-[1.07rem]"
                              style={{ color: palette.subtext }}
                            >
                              {sec.subtitle[locale]}
                            </p>
                          </div>

                          {sec.highlightNote && (
                            <p
                              className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em]"
                              style={{ color: leaf }}
                            >
                              <span className="me-2">※</span>
                              {sec.highlightNote[locale]}
                            </p>
                          )}

                          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                            <Link
                              href={
                                userContext?.isAuthenticated
                                  ? "/app"
                                  : sec.primaryCtaHref || "/login"
                              }
                              onClick={() =>
                                trackExperienceEvent(
                                  "hero_cta_clicked",
                                  { cta: "primary" },
                                  locale
                                )
                              }
                              className="sva-btn h-13 text-sm"
                              style={{
                                backgroundColor: ink,
                                color: isDark ? "#0B0F0C" : "#F1EDE3",
                                minHeight: 52,
                              }}
                            >
                              <span className="sva-btn-label px-6">
                                {sec.primaryCtaLabel?.[locale] ||
                                  (isRtl ? "ابدأ مشروعك" : "Start your project")}
                              </span>
                              <span className="sva-btn-tile w-13" style={{ width: 52 }}>
                                <ArrowRight className="h-4 w-4" style={{ color: leaf }} />
                              </span>
                            </Link>

                            <a
                              href={sec.secondaryCtaHref || "#sec-03-journey"}
                              onClick={() =>
                                trackExperienceEvent(
                                  "hero_cta_clicked",
                                  { cta: "secondary" },
                                  locale
                                )
                              }
                              className="group inline-flex items-center gap-3 text-sm font-medium"
                              style={{ color: palette.text }}
                            >
                              <span
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors group-hover:border-[#BF9A4A]"
                                style={{ borderColor: palette.border }}
                              >
                                <Play className="h-3 w-3 fill-current" style={{ color: leaf }} />
                              </span>
                              <span className="sva-link-underline">
                                {sec.secondaryCtaLabel?.[locale] ||
                                  (isRtl
                                    ? "شاهد كيف يعمل النظام"
                                    : "Watch how it works")}
                              </span>
                            </a>
                          </div>

                          {/* Ledger */}
                          <dl
                            className="mt-14 grid grid-cols-1 border-t sm:grid-cols-3"
                            style={{ borderColor: palette.border }}
                          >
                            {[
                              {
                                n: "I",
                                k: isRtl ? "الهيكلة" : "Structure",
                                v: isRtl
                                  ? "مراحل ودورات عمل ومهام مترابطة"
                                  : "Gated milestones, sprints & tasks",
                              },
                              {
                                n: "II",
                                k: isRtl ? "الإشراف" : "Supervision",
                                v: isRtl
                                  ? "ملاحظات المشرف والاجتماعات موثقة"
                                  : "Supervisor feedback & decision logs",
                              },
                              {
                                n: "III",
                                k: isRtl ? "المناقشة" : "Defense",
                                v: isRtl
                                  ? "حزمة تسليم رسمية وجاهزية كاملة"
                                  : "Verified package & defense readiness",
                              },
                            ].map((row, i) => (
                              <div
                                key={row.n}
                                className={`pt-5 pb-1 sm:pe-6 ${
                                  i > 0 ? "sm:border-s sm:ps-6" : ""
                                }`}
                                style={{ borderColor: palette.border }}
                              >
                                <dt className="flex items-baseline gap-3">
                                  <span
                                    className="text-2xl italic leading-none"
                                    style={{
                                      fontFamily: "var(--sva-display-latin)",
                                      color: leaf,
                                    }}
                                  >
                                    {row.n}
                                  </span>
                                  <span className="font-mono text-[10px] uppercase tracking-[0.24em]">
                                    {row.k}
                                  </span>
                                </dt>
                                <dd
                                  className="mt-2 text-[13px] leading-relaxed"
                                  style={{ color: palette.subtext }}
                                >
                                  {row.v}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>

                        {/* Right Column: Real 3D Video + Interactive Spatial Stage */}
                        <div className="lg:col-span-5">
                          <figure
                            className="relative transition-transform duration-500"
                            style={{
                              transform: `translate3d(${mouseOffset.x * 0.6}px, ${mouseOffset.y * 0.6}px, 0)`,
                            }}
                          >
                            <div
                              className="flex items-end justify-between gap-3 border-b pb-3"
                              style={{ borderColor: palette.border }}
                            >
                              <span
                                className="font-mono text-[10px] uppercase tracking-[0.26em]"
                                style={{ color: palette.subtext }}
                              >
                                <span style={{ color: leaf }}>Fig. 01</span>
                                <span className="mx-2">—</span>
                                {isRtl ? "المشروع كمنظومة" : "The project, as a system"}
                              </span>
                              <div
                                className="flex items-center font-mono text-[10px] uppercase tracking-[0.2em]"
                                role="tablist"
                              >
                                {(
                                  [
                                    { k: "VIDEO", ar: "مشهد", en: "Film", Icon: Film },
                                    { k: "INTERACTIVE", ar: "شبكة", en: "Grid", Icon: Layers },
                                  ] as const
                                ).map(({ k, ar, en, Icon }) => (
                                  <button
                                    key={k}
                                    type="button"
                                    role="tab"
                                    aria-selected={heroViewMode === k}
                                    onClick={() => setHeroViewMode(k)}
                                    className="inline-flex items-center gap-1.5 border-b px-2.5 pb-1 transition-colors"
                                    style={{
                                      borderColor:
                                        heroViewMode === k ? leaf : "transparent",
                                      color:
                                        heroViewMode === k ? palette.text : palette.subtext,
                                    }}
                                  >
                                    <Icon className="h-3 w-3" />
                                    <span>{isRtl ? ar : en}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {heroViewMode === "VIDEO" ? (
                              <div>
                              <div className="relative mt-4 overflow-hidden bg-[#0B0F0C]">
                                <video
                                  src={heroVideo.url}
                                  poster={heroPoster.url}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  onPlay={() =>
                                    trackExperienceEvent(
                                      "video_started",
                                      { slot: heroVideo.url },
                                      locale
                                    )
                                  }
                                  className="aspect-[4/5] w-full object-cover sm:aspect-[5/6]"
                                />
                              </div>
                              <figcaption
                                className="mt-3 flex items-start justify-between gap-4 text-[12px] leading-relaxed"
                                style={{ color: palette.subtext }}
                              >
                                <span
                                  style={{
                                    fontFamily: isRtl
                                      ? undefined
                                      : "var(--sva-display-latin)",
                                    fontStyle: isRtl ? "normal" : "italic",
                                    fontSize: isRtl ? "12px" : "14px",
                                  }}
                                >
                                  {isRtl
                                    ? "عناصر المشروع المبعثرة، يجمعها خيط واحد."
                                    : "Scattered project material, gathered by a single thread."}
                                </span>
                                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em]">
                                  16 : 9 · Motion
                                </span>
                              </figcaption>
                              </div>
                            ) : (
                              <div
                                className="relative mt-4 min-h-[340px] overflow-hidden rounded-xl border p-4"
                                style={{
                                  borderColor: palette.border,
                                  backgroundColor: palette.elevated,
                                }}
                              >
                                <div className="mb-3 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setHeroStructured((s) => !s)}
                                    className="inline-flex items-center gap-1.5 border-b border-[#BF9A4A] pb-0.5 font-mono text-[10px] uppercase tracking-[0.2em]"
                                    style={{ color: palette.text }}
                                  >
                                    <RefreshCw className="h-3 w-3" />
                                    <span>
                                      {heroStructured
                                        ? isRtl
                                          ? "معاينة الفوضى"
                                          : "Preview Chaos"
                                        : isRtl
                                        ? "تنظيم فوري"
                                        : "Align Grid"}
                                    </span>
                                  </button>
                                </div>
                                <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  {[
                                    {
                                      tag: "MILESTONE 03",
                                      titleAr: "بنية النظام والنموذج الأولي",
                                      titleEn: "System Architecture & MVP",
                                      statusAr: "مكتمل 100%",
                                      statusEn: "100% Verified",
                                      accent: "#477C55",
                                      chaosTransform:
                                        "rotate(-6deg) translate(-8px, 10px)",
                                    },
                                    {
                                      tag: "SPRINT 04 · ACTIVE",
                                      titleAr: "تكامل الواجهات واختبارات الأداء",
                                      titleEn: "API Integration & Load QA",
                                      statusAr: "8 مهام نشطة",
                                      statusEn: "8 Active Tasks",
                                      accent: "#C9A13C",
                                      chaosTransform:
                                        "rotate(5deg) translate(10px, -6px)",
                                    },
                                    {
                                      tag: "SUPERVISOR REVIEW",
                                      titleAr: "اعتماد فصل المنهجية العلمية",
                                      titleEn: "Methodology Chapter Sign-off",
                                      statusAr: "تمت المعالجة",
                                      statusEn: "Resolved · Dr. Khaled",
                                      accent: "#B86A39",
                                      chaosTransform:
                                        "rotate(7deg) translate(-12px, 8px)",
                                    },
                                    {
                                      tag: "FINAL DEFENSE",
                                      titleAr: "جاهزية يوم المناقشة: 94%",
                                      titleEn: "Defense Room Readiness: 94%",
                                      statusAr: "الحزمة جاهزة",
                                      statusEn: "Package Ready",
                                      accent: "#C9A13C",
                                      chaosTransform:
                                        "rotate(-5deg) translate(6px, 12px)",
                                    },
                                  ].map((card, i) => (
                                    <div
                                      key={i}
                                      className="rounded-xl border p-3.5 transition-all duration-700"
                                      style={{
                                        backgroundColor: palette.surface,
                                        borderColor: heroStructured
                                          ? "rgba(201, 161, 60, 0.38)"
                                          : "rgba(184, 106, 57, 0.45)",
                                        transform: heroStructured
                                          ? "rotate(0deg) translate(0, 0)"
                                          : card.chaosTransform,
                                      }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span
                                          className="font-mono text-[10px] font-semibold uppercase tracking-wider"
                                          style={{ color: card.accent }}
                                        >
                                          {card.tag}
                                        </span>
                                        <span
                                          className="font-mono text-[10px]"
                                          style={{ color: palette.subtext }}
                                        >
                                          {isRtl ? card.statusAr : card.statusEn}
                                        </span>
                                      </div>
                                      <p
                                        className="mt-2 text-xs font-semibold"
                                        style={{ color: palette.text }}
                                      >
                                        {isRtl ? card.titleAr : card.titleEn}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </figure>
                        </div>
                      </div>
                    );
                  })()}

                {/* ==========================================================
                    SECTION 02: CHAOS -> CONTROL
                    ========================================================== */}
                {sec.type === "CHAOS_TO_CONTROL" &&
                  (() => {
                    const sceneImg = resolveMedia(
                      sec.posterSlotId,
                      "/media/experience/landing-chaos-continuity.jpg"
                    );
                    return (
                      <div className="mx-auto max-w-6xl">
                        <div className="text-center">
                          <span className="sva-eyebrow">
                            {sec.eyebrow[locale]}
                          </span>
                          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                            “{sec.title[locale]}”
                          </h2>
                          <p
                            className="mx-auto mt-4 max-w-2xl text-base"
                            style={{ color: palette.subtext }}
                          >
                            {sec.subtitle[locale]}
                          </p>
                        </div>

                        {/* Editorial 3D Visual Frame + Interactive Grid */}
                        <div className="mt-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                          <div
                            className="overflow-hidden border shadow-2xl lg:col-span-5"
                            style={{
                              borderColor: leaf,
                              backgroundColor: palette.surface,
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={sceneImg.url}
                              alt={sceneImg.alt}
                              className="aspect-[16/10] w-full object-cover"
                            />
                            <div
                              className="border-t px-4 py-3 font-mono text-[11px] leading-relaxed"
                              style={{
                                borderColor: palette.border,
                                backgroundColor: palette.elevated,
                                color: palette.subtext,
                              }}
                            >
                              {isRtl
                                ? "الخيوط الذهبية تجمع الأوراق البحثية والمخططات والمجلدات في سجل واحد"
                                : "Golden threads linking scattered blueprints, folders, and research notes"}
                            </div>
                          </div>

                          <div className="lg:col-span-7">
                            <div className="mb-5 flex justify-start">
                              <div
                                className="inline-flex rounded-xl border p-1"
                                style={{
                                  borderColor: palette.border,
                                  backgroundColor: palette.surface,
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => setChaosResolved(false)}
                                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                                    !chaosResolved
                                      ? "bg-[#95542E] text-white"
                                      : "opacity-75 hover:opacity-100"
                                  }`}
                                >
                                  {isRtl
                                    ? "قبل النظام: ١٠ أماكن متفرقة"
                                    : "Before: Scattered Across 10 Places"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setChaosResolved(true)}
                                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                                    chaosResolved
                                      ? "bg-[#163522] text-[#F3EACB] border border-[#C9A13C]/40"
                                      : "opacity-75 hover:opacity-100"
                                  }`}
                                >
                                  {isRtl
                                    ? "داخل SVA-DUATE: شبكة منظمة واحدة"
                                    : "Inside SVA-DUATE: Unified Architecture"}
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {[
                                {
                                  chaosFile: "final_report_v2_last_REAL.pdf",
                                  chaosChannel: "WhatsApp Group · 11:42 PM",
                                  orderTitleAr: "مستودع الوثائق الموحد",
                                  orderTitleEn: "Versioned Document Vault",
                                  orderMeta: "Final Report — Version 8 (SHA-256)",
                                  icon: FileText,
                                },
                                {
                                  chaosFile: "ملاحظات الدكتور صوتية.ogg",
                                  chaosChannel: "Telegram Voice Note",
                                  orderTitleAr: "بطاقات ملاحظات المشرف",
                                  orderTitleEn: "Supervisor Feedback Cards",
                                  orderMeta: "Assigned -> Resolved with Audit Trail",
                                  icon: MessageSquare,
                                },
                                {
                                  chaosFile: "تعديلات الباك اند.txt",
                                  chaosChannel: "Sticky Note / Personal Notion",
                                  orderTitleAr: "لوحة المهام والدورات الزمنية",
                                  orderTitleEn: "Sprint & Task Execution Board",
                                  orderMeta: "Bound to Milestone 03 & Owner",
                                  icon: CheckSquare,
                                },
                                {
                                  chaosFile: "موعد التسليم امتى؟؟",
                                  chaosChannel: "Unread Email Thread",
                                  orderTitleAr: "بوابات التسليم والمناقشة",
                                  orderTitleEn: "Milestone & Defense Gates",
                                  orderMeta: "Countdown + Readiness Checklist 94%",
                                  icon: Clock,
                                },
                              ].map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                  <div
                                    key={idx}
                                    className="rounded-2xl border p-4 text-start transition-all duration-500"
                                    style={{
                                      backgroundColor: palette.surface,
                                      borderColor: chaosResolved
                                        ? "rgba(201, 161, 60, 0.35)"
                                        : "rgba(184, 106, 57, 0.45)",
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#C9A13C]/30 bg-[#14261A] text-[#C9A13C]">
                                        <Icon className="h-4 w-4" />
                                      </div>
                                      <span
                                        className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold ${
                                          chaosResolved
                                            ? "bg-[#163522] text-[#DBC477]"
                                            : "bg-[#774225]/40 text-[#D39B79]"
                                        }`}
                                      >
                                        {chaosResolved
                                          ? isRtl
                                            ? "منظم"
                                            : "STRUCTURED"
                                          : isRtl
                                          ? "مبعثر"
                                          : "FRAGMENTED"}
                                      </span>
                                    </div>

                                    {chaosResolved ? (
                                      <>
                                        <h3 className="mt-3 text-sm font-semibold">
                                          {isRtl
                                            ? item.orderTitleAr
                                            : item.orderTitleEn}
                                        </h3>
                                        <p className="mt-1 font-mono text-xs text-[#C9A13C]">
                                          {item.orderMeta}
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <h3 className="mt-3 font-mono text-xs font-semibold text-[#D39B79] line-through">
                                          {item.chaosFile}
                                        </h3>
                                        <p className="mt-1 text-xs text-[#9AA99E]">
                                          {item.chaosChannel}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                {/* ==========================================================
                    SECTION 03: PROJECT JOURNEY (LIVING 3D ROADMAP + PEN ARTWORK)
                    ========================================================== */}
                {sec.type === "PROJECT_JOURNEY" &&
                  (() => {
                    const roadmapArt = resolveMedia(
                      sec.posterSlotId,
                      "/media/experience/splash-intro-poster.png"
                    );
                    const activeStation =
                      ROADMAP_STATIONS[activeStationIdx] ??
                      ROADMAP_STATIONS[0]!;

                    return (
                      <div>
                        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                          <div className="lg:col-span-6">
                            <span className="sva-eyebrow">
                              {sec.eyebrow[locale]}
                            </span>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                              {sec.title[locale]}
                            </h2>
                            <p
                              className="mt-3 text-base"
                              style={{ color: palette.subtext }}
                            >
                              {sec.subtitle[locale]}
                            </p>
                          </div>

                          <div
                            className="overflow-hidden border shadow-2xl lg:col-span-6"
                            style={{
                              borderColor: leaf,
                              backgroundColor: palette.surface,
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={roadmapArt.url}
                              alt={roadmapArt.alt}
                              className="h-52 w-full object-cover sm:h-60"
                            />
                            <div
                              className="flex items-center justify-between border-t px-4 py-2.5 font-mono text-[11px]"
                              style={{
                                borderColor: palette.border,
                                backgroundColor: palette.elevated,
                                color: palette.subtext,
                              }}
                            >
                              <span>
                                {isRtl
                                  ? "القلم الفاخر يتحول إلى مخطط معماري ذهبي"
                                  : "From First Stroke to Architectural Structure"}
                              </span>
                              <span style={{ color: leaf }}>8 STATIONS</span>
                            </div>
                          </div>
                        </div>

                        <div className="relative mt-8">
                          <div className="hidden h-[2px] w-full bg-gradient-to-r from-[#98701E] via-[#C9A13C] to-[#B86A39] lg:block" />
                          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                            {ROADMAP_STATIONS.map((st, idx) => {
                              const isActive = idx === activeStationIdx;
                              const isPassed = idx <= activeStationIdx;
                              return (
                                <button
                                  key={st.id}
                                  type="button"
                                  onClick={() => {
                                    setActiveStationIdx(idx);
                                    trackExperienceEvent(
                                      "workflow_played",
                                      { station: st.id },
                                      locale
                                    );
                                  }}
                                  className="group flex flex-col items-start rounded-xl border p-3.5 text-start transition-all"
                                  style={{
                                    backgroundColor: isActive
                                      ? "#163522"
                                      : palette.surface,
                                    borderColor: isActive
                                      ? "#C9A13C"
                                      : isPassed
                                      ? "rgba(201, 161, 60, 0.45)"
                                      : palette.border,
                                    color: isActive ? "#F2F4F1" : palette.text,
                                  }}
                                >
                                  <span className="font-mono text-xs font-bold text-[#C9A13C]">
                                    {st.step}
                                  </span>
                                  <span className="mt-2 text-xs font-semibold">
                                    {isRtl ? st.ar : st.en}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          <div
                            className="mt-6 flex flex-col justify-between gap-6 rounded-2xl border p-6 sm:flex-row sm:items-center"
                            style={{
                              backgroundColor: palette.surface,
                              borderColor: "rgba(201, 161, 60, 0.4)",
                            }}
                          >
                            <div>
                              <div className="flex items-center gap-2.5">
                                <span className="rounded-md bg-[#C9A13C]/20 px-2.5 py-0.5 font-mono text-xs font-semibold text-[#C9A13C]">
                                  STATION {activeStation.step} / 08
                                </span>
                                <h3 className="text-lg font-semibold">
                                  {isRtl ? activeStation.ar : activeStation.en}
                                </h3>
                              </div>
                              <p
                                className="mt-2 text-sm"
                                style={{ color: palette.subtext }}
                              >
                                {isRtl
                                  ? activeStation.descAr
                                  : activeStation.descEn}
                              </p>
                            </div>

                            <div
                              className="shrink-0 rounded-xl border border-[#C9A13C]/35 px-4 py-3"
                              style={{ backgroundColor: palette.elevated }}
                            >
                              <span
                                className="block font-mono text-[10px] uppercase tracking-wider"
                                style={{ color: palette.subtext }}
                              >
                                {isRtl
                                  ? "المخرج الرسمي للمحطة"
                                  : "STATION DELIVERABLE"}
                              </span>
                              <span className="mt-1 block text-xs font-semibold text-[#B38627]">
                                {isRtl
                                  ? activeStation.deliverableAr
                                  : activeStation.deliverableEn}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                {/* ==========================================================
                    SECTION 04: PRODUCT UNIVERSE (3D MONOLITH SCULPTURE + ORBITS)
                    ========================================================== */}
                {sec.type === "PRODUCT_UNIVERSE" &&
                  (() => {
                    const universeImg = resolveMedia(
                      sec.posterSlotId,
                      "/media/experience/landing-product-universe.jpg"
                    );
                    const activeOrbit =
                      UNIVERSE_ORBITS[activeOrbitIdx] ?? UNIVERSE_ORBITS[0]!;

                    return (
                      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                          <span className="sva-eyebrow">
                            {sec.eyebrow[locale]}
                          </span>
                          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                            {sec.title[locale]}
                          </h2>
                          <p
                            className="mt-3 text-sm leading-relaxed"
                            style={{ color: palette.subtext }}
                          >
                            {sec.subtitle[locale]}
                          </p>

                          {/* 3D Monolith Sculpture Showcase */}
                          <div
                            className="mt-5 overflow-hidden border shadow-xl"
                            style={{
                              borderColor: leaf,
                              backgroundColor: palette.surface,
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={universeImg.url}
                              alt={universeImg.alt}
                              className="h-64 w-full object-cover"
                            />
                          </div>

                          <div
                            className="mt-4 rounded-2xl border p-4"
                            style={{
                              backgroundColor: palette.surface,
                              borderColor: "#C9A13C",
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-base font-semibold text-[#C9A13C]">
                                {isRtl ? activeOrbit.ar : activeOrbit.en}
                              </span>
                              <span className="rounded-full bg-[#163522] px-3 py-1 font-mono text-xs text-[#F3EACB]">
                                {activeOrbit.metric}
                              </span>
                            </div>
                            <p
                              className="mt-2 text-sm"
                              style={{ color: palette.subtext }}
                            >
                              {isRtl ? activeOrbit.roleAr : activeOrbit.roleEn}
                            </p>
                          </div>
                        </div>

                        <div className="lg:col-span-7">
                          <div
                            className="relative rounded-2xl border p-6"
                            style={{
                              borderColor: palette.border,
                              backgroundColor: palette.elevated,
                            }}
                          >
                            <div className="mb-5 flex items-center justify-center">
                              <div className="flex items-center gap-3 rounded-2xl border border-[#C9A13C] bg-[#163522] px-5 py-3 shadow-lg">
                                <Cpu className="h-5 w-5 text-[#C9A13C]" />
                                <div>
                                  <span className="block text-xs font-bold uppercase tracking-wider text-[#F3EACB]">
                                    {isRtl
                                      ? "نواة مشروع التخرج"
                                      : "YOUR PROJECT CORE"}
                                  </span>
                                  <span className="block font-mono text-[11px] text-[#DBC477]">
                                    Single Source of Academic Truth
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                              {UNIVERSE_ORBITS.map((orb, idx) => {
                                const Icon = orb.icon;
                                const selected = idx === activeOrbitIdx;
                                return (
                                  <button
                                    key={orb.id}
                                    type="button"
                                    onClick={() => setActiveOrbitIdx(idx)}
                                    className="flex flex-col items-start rounded-xl border p-3.5 text-start transition-all"
                                    style={{
                                      backgroundColor: selected
                                        ? "#163522"
                                        : palette.surface,
                                      borderColor: selected
                                        ? "#C9A13C"
                                        : palette.border,
                                      color: selected ? "#F2F4F1" : palette.text,
                                    }}
                                  >
                                    <Icon className="h-4 w-4 text-[#C9A13C]" />
                                    <span className="mt-2.5 text-xs font-semibold">
                                      {isRtl ? orb.ar : orb.en}
                                    </span>
                                    <span
                                      className="mt-1 font-mono text-[10px]"
                                      style={{
                                        color: selected
                                          ? "#DBC477"
                                          : palette.subtext,
                                      }}
                                    >
                                      {orb.metric}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                {/* ==========================================================
                    SECTION 05: ARCHITECTURAL PLANNING
                    ========================================================== */}
                {sec.type === "PLANNING" &&
                  (() => {
                    const planningImg = resolveMedia(
                      sec.posterSlotId,
                      "/media/experience/landing-planning-submission.jpg"
                    );
                    return (
                      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                          <span className="sva-eyebrow">
                            {sec.eyebrow[locale]}
                          </span>
                          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                            {sec.title[locale]}
                          </h2>
                          <p
                            className="mt-3 text-base"
                            style={{ color: palette.subtext }}
                          >
                            {sec.subtitle[locale]}
                          </p>

                          <div className="mt-6 overflow-hidden rounded-2xl border border-[#C9A13C]/35 shadow-xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={planningImg.url}
                              alt={planningImg.alt}
                              className="h-64 w-full object-cover"
                            />
                          </div>
                        </div>

                        <div className="lg:col-span-7">
                          <div
                            className="rounded-2xl border p-6"
                            style={{
                              backgroundColor: palette.surface,
                              borderColor: palette.border,
                            }}
                          >
                            {[
                              {
                                tier: "01 · GOAL",
                                titleAr:
                                  "الهدف العام: منصة تشغيل الحرم الجامعي الذكي (SCOP)",
                                titleEn:
                                  "Project Goal: Smart Campus Operations Platform (SCOP)",
                                meta: "Academic Year 2026 · Engineering Capstone",
                                indent: 0,
                              },
                              {
                                tier: "02 · MILESTONE",
                                titleAr:
                                  "المرحلة الثانية: بناء البنية المعمارية وخط أنابيب المستشعرات",
                                titleEn:
                                  "Milestone 02: Core Architecture & IoT Sensor Pipeline",
                                meta: "Weight: 30% · Due Nov 20 · Deliverable Required",
                                indent: 1,
                              },
                              {
                                tier: "03 · SPRINT",
                                titleAr:
                                  "الدورة التنفيذية الرابعة (Sprint 04): واجهات القياس اللحظي",
                                titleEn:
                                  "Sprint 04: Real-time Telemetry & Alert Thresholds",
                                meta: "14 Days · Capacity: 34 Story Points",
                                indent: 2,
                              },
                              {
                                tier: "04 · TASK",
                                titleAr:
                                  "مهمة #108: ربط تنبيهات استهلاك الطاقة بلوحة المراقبة",
                                titleEn:
                                  "Task #108: Bind Anomaly Detection Stream to Overview UI",
                                meta: "Assignee: Omar Al-Masri · Priority: HIGH · 4/4 Checklist",
                                indent: 3,
                              },
                            ].map((row, idx) => (
                              <div
                                key={row.tier}
                                className="relative mb-3 last:mb-0"
                                style={{
                                  paddingInlineStart: `${row.indent * 20}px`,
                                }}
                              >
                                <div
                                  className="rounded-xl border p-4 transition-all"
                                  style={{
                                    backgroundColor:
                                      idx === 3 ? "#163522" : palette.elevated,
                                    borderColor:
                                      idx === 3 ? "#C9A13C" : palette.border,
                                    color: idx === 3 ? "#F2F4F1" : palette.text,
                                  }}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-mono text-xs font-bold text-[#C9A13C]">
                                      {row.tier}
                                    </span>
                                    <span className="font-mono text-[11px] opacity-80">
                                      {row.meta}
                                    </span>
                                  </div>
                                  <p className="mt-1.5 text-sm font-semibold">
                                    {isRtl ? row.titleAr : row.titleEn}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                {/* ==========================================================
                    SECTION 06: LIVE EXECUTION BOARD RECONSTRUCTION
                    ========================================================== */}
                {sec.type === "EXECUTION" &&
                  (() => {
                    const execDeskImg = resolveMedia(
                      sec.posterSlotId,
                      "/media/experience/landing-hero-poster.jpg"
                    );
                    return (
                      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                          <span className="sva-eyebrow">
                            {sec.eyebrow[locale]}
                          </span>
                          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                            {sec.title[locale]}
                          </h2>
                          <p
                            className="mt-3 text-base"
                            style={{ color: palette.subtext }}
                          >
                            {sec.subtitle[locale]}
                          </p>

                          <div className="mt-5 overflow-hidden rounded-2xl border border-[#C9A13C]/35 shadow-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={execDeskImg.url}
                              alt={execDeskImg.alt}
                              className="h-48 w-full object-cover"
                            />
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2">
                            {[
                              { step: 0, ar: "١. قيد الانتظار", en: "1. To Do" },
                              {
                                step: 1,
                                ar: "٢. جاري التنفيذ",
                                en: "2. In Progress",
                              },
                              {
                                step: 2,
                                ar: "٣. قيد المراجعة",
                                en: "3. In Review",
                              },
                              { step: 3, ar: "٤. مكتمل", en: "4. Done" },
                            ].map((st) => (
                              <button
                                key={st.step}
                                type="button"
                                onClick={() =>
                                  setExecutionStep(st.step as 0 | 1 | 2 | 3)
                                }
                                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                                  executionStep === st.step
                                    ? "border-[#C9A13C] bg-[#163522] text-white"
                                    : "border-transparent bg-black/10 opacity-75"
                                }`}
                              >
                                {isRtl ? st.ar : st.en}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="lg:col-span-7">
                          <div
                            className="rounded-2xl border p-5"
                            style={{
                              borderColor: palette.border,
                              backgroundColor: palette.elevated,
                              color: palette.text,
                            }}
                          >
                            <div
                              className="flex items-center justify-between border-b pb-3"
                              style={{ borderColor: palette.border }}
                            >
                              <span className="font-mono text-xs font-semibold text-[#C9A13C]">
                                SPRINT 04 · LIVE BOARD RECONSTRUCTION
                              </span>
                              <span className="font-mono text-xs font-bold text-[#C9A13C]">
                                {isRtl
                                  ? "نسبة إنجاز الدورة:"
                                  : "Sprint Progress:"}{" "}
                                {executionStep === 0
                                  ? "64%"
                                  : executionStep === 1
                                  ? "72%"
                                  : executionStep === 2
                                  ? "84%"
                                  : "96%"}
                              </span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                              {[
                                { col: 0, ar: "قيد الانتظار", en: "TO DO" },
                                {
                                  col: 1,
                                  ar: "جاري التنفيذ",
                                  en: "IN PROGRESS",
                                },
                                { col: 2, ar: "المراجعة", en: "REVIEW" },
                                { col: 3, ar: "مكتمل", en: "DONE" },
                              ].map((column) => {
                                const hasCard = executionStep === column.col;
                                return (
                                  <div
                                    key={column.col}
                                    className="min-h-[170px] rounded-xl border p-3"
                                    style={{
                                      borderColor: palette.border,
                                      backgroundColor: palette.surface,
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span
                                        className="font-mono text-[10px] font-semibold"
                                        style={{ color: palette.subtext }}
                                      >
                                        {isRtl ? column.ar : column.en}
                                      </span>
                                      <span className="h-2 w-2 rounded-full bg-[#C9A13C]/50" />
                                    </div>

                                    {hasCard ? (
                                      <div className="mt-3 rounded-xl border border-[#C9A13C] bg-[#163522] p-3 shadow-lg transition-all duration-500">
                                        <span className="font-mono text-[10px] text-[#DBC477]">
                                          TSK-204 · HIGH
                                        </span>
                                        <p className="mt-1 text-xs font-semibold text-white">
                                          {isRtl
                                            ? "تشفير حزمة التسليم SHA-256"
                                            : "SHA-256 Submission Seal"}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-[#DBC477]">
                                          <span>Omar A.</span>
                                          <span>3/3 Checks</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        className="mt-3 h-24 rounded-xl border border-dashed"
                                        style={{ borderColor: palette.border }}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                {/* ==========================================================
                    SECTION 07: MEETINGS -> ACTIONS
                    ========================================================== */}
                {sec.type === "MEETINGS_TO_ACTIONS" &&
                  (() => {
                    const meetingImg = resolveMedia(
                      sec.posterSlotId,
                      "/media/experience/landing-team-meetings.jpg"
                    );
                    return (
                      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                          <span className="sva-eyebrow">
                            {sec.eyebrow[locale]}
                          </span>
                          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                            “{sec.title[locale]}”
                          </h2>
                          <p
                            className="mt-3 text-base"
                            style={{ color: palette.subtext }}
                          >
                            {sec.subtitle[locale]}
                          </p>

                          <div className="mt-5 overflow-hidden rounded-2xl border border-[#C9A13C]/35 shadow-xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={meetingImg.url}
                              alt={meetingImg.alt}
                              className="h-52 w-full object-cover"
                            />
                          </div>

                          <div className="mt-5 flex flex-wrap gap-2">
                            {[
                              {
                                idx: 0,
                                ar: "١. محضر الاجتماع",
                                en: "1. Meeting Note",
                              },
                              {
                                idx: 1,
                                ar: "٢. بند تنفيذي ذهبي",
                                en: "2. Gold Action Item",
                              },
                              {
                                idx: 2,
                                ar: "٣. مهمة مسندة لعضو",
                                en: "3. Assigned Task",
                              },
                            ].map((b) => (
                              <button
                                key={b.idx}
                                type="button"
                                onClick={() =>
                                  setMeetingMorphStep(b.idx as 0 | 1 | 2)
                                }
                                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                                  meetingMorphStep === b.idx
                                    ? "border-[#C9A13C] bg-[#163522] text-[#F3EACB]"
                                    : "border-transparent bg-black/10 opacity-75 hover:opacity-100"
                                }`}
                              >
                                {isRtl ? b.ar : b.en}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="lg:col-span-7">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div
                              className="rounded-2xl border p-5 transition-all"
                              style={{
                                backgroundColor: palette.surface,
                                borderColor:
                                  meetingMorphStep >= 0
                                    ? "rgba(201, 161, 60, 0.65)"
                                    : palette.border,
                              }}
                            >
                              <span
                                className="font-mono text-[10px]"
                                style={{ color: palette.subtext }}
                              >
                                STEP 01 · MINUTES
                              </span>
                              <p
                                className="mt-2 text-xs font-semibold"
                                style={{ color: palette.text }}
                              >
                                {isRtl
                                  ? "اجتماع المراجعة الأسبوعي #06"
                                  : "Weekly Supervisor Sync #06"}
                              </p>
                              <p
                                className="mt-3 rounded-lg border border-[#C9A13C]/40 bg-[#C9A13C]/15 p-2.5 text-xs"
                                style={{ color: palette.text }}
                              >
                                {isRtl
                                  ? "«يجب إضافة اختبار التحمل لقاعدة البيانات قبل تسليم المرحلة الثالثة.»"
                                  : "“Add database stress benchmark before Milestone 3 submission.”"}
                              </p>
                            </div>

                            <div
                              className={`rounded-2xl border p-5 transition-all ${
                                meetingMorphStep >= 1 ? "" : "opacity-50"
                              }`}
                              style={{
                                backgroundColor: palette.elevated,
                                borderColor:
                                  meetingMorphStep >= 1
                                    ? "#C9A13C"
                                    : palette.border,
                              }}
                            >
                              <span className="font-mono text-[10px] font-bold text-[#C9A13C]">
                                STEP 02 · ACTION ITEM
                              </span>
                              <p
                                className="mt-2 text-xs font-semibold"
                                style={{ color: palette.text }}
                              >
                                {isRtl
                                  ? "بند تنفيذي مستخرج تلقائيًا"
                                  : "Extracted Action Item"}
                              </p>
                              <div className="mt-3 rounded-lg bg-[#163522] p-2.5 font-mono text-[11px] text-[#F3EACB]">
                                ACT-019 · Benchmark DB Latency (p95 &lt; 120ms)
                              </div>
                            </div>

                            <div
                              className={`rounded-2xl border p-5 transition-all ${
                                meetingMorphStep >= 2
                                  ? "border-[#C9A13C] bg-[#163522]"
                                  : "opacity-50"
                              }`}
                              style={
                                meetingMorphStep < 2
                                  ? {
                                      backgroundColor: palette.surface,
                                      borderColor: palette.border,
                                    }
                                  : undefined
                              }
                            >
                              <span className="font-mono text-[10px] text-[#C9A13C]">
                                STEP 03 · ASSIGNED TASK
                              </span>
                              <p
                                className="mt-2 text-xs font-semibold"
                                style={{
                                  color:
                                    meetingMorphStep >= 2
                                      ? "#FFFFFF"
                                      : palette.text,
                                }}
                              >
                                {isRtl
                                  ? "مهمة رسمية في لوحة الفريق"
                                  : "Bound to Team Member Queue"}
                              </p>
                              <div className="mt-3 rounded-lg bg-[#08110B]/80 p-2.5 text-xs text-[#DBC477]">
                                <div>Owner: Sara Khalid</div>
                                <div className="mt-1 font-mono text-[10px]">
                                  Due: Thursday · Linked to MTG-06
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                {/* ==========================================================
                    SECTION 08: SUPERVISOR FEEDBACK (REAL PEN ANNOTATION PHOTO)
                    ========================================================== */}
                {sec.type === "SUPERVISOR_FEEDBACK" &&
                  (() => {
                    const feedbackImg = resolveMedia(
                      sec.posterSlotId,
                      "/media/experience/landing-supervisor-feedback.jpg"
                    );
                    return (
                      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                          <span className="sva-eyebrow">
                            {sec.eyebrow[locale]}
                          </span>
                          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                            “{sec.title[locale]}”
                          </h2>
                          <p
                            className="mt-3 text-base"
                            style={{ color: palette.subtext }}
                          >
                            {sec.subtitle[locale]}
                          </p>

                          <div className="mt-6 flex gap-2">
                            {(["ANNOTATE", "ASSIGN", "RESOLVE"] as const).map(
                              (st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => setFeedbackStep(st)}
                                  className="border px-3.5 py-1.5 font-mono text-xs font-semibold transition-all"
                                  style={{
                                    borderColor:
                                      feedbackStep === st ? leaf : palette.border,
                                    backgroundColor:
                                      feedbackStep === st
                                        ? ink
                                        : palette.surface,
                                    color:
                                      feedbackStep === st
                                        ? isDark
                                          ? "#0B0F0C"
                                          : "#F1EDE3"
                                        : palette.text,
                                  }}
                                >
                                  {st}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        <div className="lg:col-span-7">
                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {/* Real Supervisor Fountain Pen Annotation Image */}
                            <div
                              className="overflow-hidden border shadow-2xl"
                              style={{
                                borderColor: leaf,
                                backgroundColor: palette.surface,
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={feedbackImg.url}
                                alt={feedbackImg.alt}
                                className="h-64 w-full object-cover"
                              />
                              <div className="p-4 text-xs text-[#F2F4F1]">
                                <span className="font-mono text-[10px] font-bold text-[#C9A13C]">
                                  PROJECT REPORT · PAGE 42
                                </span>
                                <p className="mt-1 text-xs text-[#DBC477]">
                                  {isRtl
                                    ? "ملاحظة المشرف الأكاديمي مدونة مباشرة على التقرير"
                                    : "Supervisor fountain-pen annotation directly on Project Report"}
                                </p>
                              </div>
                            </div>

                            {/* Lifted Feedback Card */}
                            <div
                              className="flex flex-col justify-between rounded-2xl border border-[#C9A13C] p-5 shadow-2xl"
                              style={{
                                backgroundColor: palette.surface,
                                color: palette.text,
                              }}
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-xs font-semibold text-[#C9A13C]">
                                    FBK-031 · ACADEMIC REVIEW CARD
                                  </span>
                                  <span className="rounded-full bg-[#163522] px-2.5 py-0.5 font-mono text-[10px] text-[#DBC477]">
                                    {feedbackStep}
                                  </span>
                                </div>
                                <p className="mt-3 text-sm font-semibold">
                                  {isRtl
                                    ? "إضافة مقارنة هامش الخطأ الإحصائي في الفصل الرابع"
                                    : "Add Confidence Interval Comparison in Ch. 4"}
                                </p>
                                <p className="mt-2 rounded-lg border-s-2 border-[#B86A39] bg-[#163522] p-2.5 text-xs text-[#F3EACB]">
                                  {isRtl
                                    ? "يرجى مقارنة النتائج مع النظام المرجعي في الفصل الثاني وتوضيح هامش الخطأ."
                                    : "Compare latency against Chapter 2 baseline and state confidence intervals."}
                                </p>
                              </div>

                              <div
                                className="mt-4 space-y-2 border-t pt-3 text-xs"
                                style={{
                                  borderColor: palette.border,
                                  color: palette.subtext,
                                }}
                              >
                                <div className="flex justify-between">
                                  <span>{isRtl ? "المشرف:" : "Reviewer:"}</span>
                                  <span
                                    className="font-semibold"
                                    style={{ color: palette.text }}
                                  >
                                    Dr. Khaled Mansour
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>
                                    {isRtl ? "المسند إليه:" : "Assigned To:"}
                                  </span>
                                  <span className="font-semibold text-[#C9A13C]">
                                    Lina Tareq (Research)
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>
                                    {isRtl ? "الإصدار المرتبط:" : "Resolved In:"}
                                  </span>
                                  <span className="font-mono font-semibold text-[#477C55]">
                                    Final Report v8
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                {/* ==========================================================
                    SECTION 09: DOCUMENTS (ARCHIVAL STACK PHOTO + VERSION 8)
                    ========================================================== */}
                {sec.type === "DOCUMENTS" &&
                  (() => {
                    const docsImg = resolveMedia(
                      sec.posterSlotId,
                      "/media/experience/landing-documents-v8.jpg"
                    );
                    return (
                      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                        <div className="lg:col-span-5">
                          <span className="sva-eyebrow">
                            {sec.eyebrow[locale]}
                          </span>
                          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                            {sec.title[locale]}
                          </h2>
                          <p
                            className="mt-3 text-base"
                            style={{ color: palette.subtext }}
                          >
                            {sec.subtitle[locale]}
                          </p>

                          <div className="mt-5 overflow-hidden rounded-2xl border border-[#C9A13C]/40 shadow-xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={docsImg.url}
                              alt={docsImg.alt}
                              className="h-52 w-full object-cover"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => setDocsCollapsed((c) => !c)}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#C9A13C] bg-[#163522] px-4 py-2.5 text-xs font-semibold text-white"
                          >
                            <RefreshCw className="h-3.5 w-3.5 text-[#C9A13C]" />
                            <span>
                              {docsCollapsed
                                ? isRtl
                                  ? "عرض الملفات المبعثرة قبل الدمج"
                                  : "Show Scattered Draft Files"
                                : isRtl
                                ? "دمج في Final Report — Version 8"
                                : "Collapse into Final Report — Version 8"}
                            </span>
                          </button>
                        </div>

                        <div className="lg:col-span-7">
                          <div
                            className="rounded-2xl border p-6"
                            style={{
                              borderColor: palette.border,
                              backgroundColor: palette.elevated,
                              color: palette.text,
                            }}
                          >
                            {!docsCollapsed ? (
                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  "final.pdf",
                                  "final2.pdf",
                                  "final-v6.pdf",
                                  "final-really-final.pdf",
                                ].map((fn, i) => (
                                  <div
                                    key={fn}
                                    className="rounded-xl border border-[#95542E] p-4 font-mono text-xs"
                                    style={{
                                      backgroundColor: palette.surface,
                                      color: "#B86A39",
                                      transform: `rotate(${
                                        i % 2 === 0 ? -2 : 2
                                      }deg)`,
                                    }}
                                  >
                                    <FileText className="mb-2 h-4 w-4 text-[#B86A39]" />
                                    <div className="font-semibold">{fn}</div>
                                    <div
                                      className="mt-1 text-[10px]"
                                      style={{ color: palette.subtext }}
                                    >
                                      Conflicting edits · Unknown author
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div>
                                <div
                                  className="flex flex-wrap items-center justify-between gap-3 border p-5 transition-colors"
                                  style={{
                                    borderColor: leaf,
                                    backgroundColor: isDark ? "#121A15" : "#FAF8F2",
                                  }}
                                >
                                  <div className="flex items-center gap-3.5">
                                    <div
                                      className="flex h-12 w-12 items-center justify-center border"
                                      style={{
                                        borderColor: leaf,
                                        backgroundColor: palette.elevated,
                                        color: leaf,
                                      }}
                                    >
                                      <FileCheck2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                      <span
                                        className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]"
                                        style={{ color: leaf }}
                                      >
                                        AUTHORITATIVE DOCUMENT
                                      </span>
                                      <h3
                                        className="text-lg font-semibold"
                                        style={{ color: palette.text }}
                                      >
                                        Final Report — Version 8
                                      </h3>
                                      <p
                                        className="font-mono text-[11px]"
                                        style={{ color: palette.subtext }}
                                      >
                                        SHA-256: 8f94e2c1...7b31a0 · Approved by
                                        Supervisor
                                      </p>
                                    </div>
                                  </div>
                                  <span
                                    className="border px-3 py-1 font-mono text-xs font-semibold"
                                    style={{
                                      borderColor: leaf,
                                      backgroundColor: palette.elevated,
                                      color: leaf,
                                    }}
                                  >
                                    v8.0 LOCKED
                                  </span>
                                </div>

                                <div className="mt-5 flex items-center justify-between gap-2 overflow-x-auto pt-2 font-mono text-xs">
                                  {[
                                    "v1",
                                    "v2",
                                    "v3",
                                    "v4",
                                    "v5",
                                    "v6",
                                    "v7",
                                    "v8 (Final)",
                                  ].map((ver, idx) => (
                                    <span
                                      key={ver}
                                      className={`rounded-lg px-2.5 py-1 ${
                                        idx === 7
                                          ? "border border-[#C9A13C] bg-[#163522] font-bold text-[#F3EACB]"
                                          : "border"
                                      }`}
                                      style={
                                        idx < 7
                                          ? {
                                              backgroundColor: palette.surface,
                                              borderColor: palette.border,
                                              color: palette.subtext,
                                            }
                                          : undefined
                                      }
                                    >
                                      {ver}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                {/* ==========================================================
                    SECTION 10: PROJECT HEALTH (SCORE 78 SPATIAL DECOMPOSITION)
                    ========================================================== */}
                {sec.type === "PROJECT_HEALTH" && (
                  <div className="mx-auto max-w-5xl">
                    <div className="text-center">
                      <span className="sva-eyebrow">
                        {sec.eyebrow[locale]}
                      </span>
                      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                        “{sec.title[locale]}”
                      </h2>
                      <p
                        className="mx-auto mt-3 max-w-2xl text-base"
                        style={{ color: palette.subtext }}
                      >
                        {sec.subtitle[locale]}
                      </p>
                    </div>

                    <div
                      className="mt-10 grid grid-cols-1 items-center gap-8 rounded-3xl border p-8 lg:grid-cols-12"
                      style={{
                        borderColor: palette.border,
                        backgroundColor: palette.surface,
                      }}
                    >
                      <div
                        className="flex flex-col items-center justify-center border-b pb-6 text-center lg:col-span-4 lg:border-b-0 lg:border-e lg:pb-0"
                        style={{ borderColor: palette.border }}
                      >
                        <span
                          className="font-mono text-xs uppercase tracking-widest"
                          style={{ color: palette.subtext }}
                        >
                          {isRtl ? "درجة صحة المشروع" : "PROJECT HEALTH INDEX"}
                        </span>
                        <div
                          className="num-tabular mt-2 text-7xl font-bold tracking-tight sm:text-8xl"
                          style={{ color: palette.text }}
                        >
                          78
                        </div>
                        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#C9A13C]/40 bg-[#163522] px-3 py-1 font-mono text-xs text-[#DBC477]">
                          {isRtl
                            ? "مستقر · قابل للتحسين"
                            : "STABLE · ACTIONABLE"}
                        </span>
                      </div>

                      <div className="space-y-3.5 lg:col-span-8">
                        {[
                          {
                            delta: "-8",
                            labelAr: "مهام متأخرة عن الموعد (Overdue work)",
                            labelEn: "Overdue work",
                            detailAr:
                              "مهمتان في Sprint 04 تجاوزتا تاريخ الاستحقاق",
                            detailEn: "2 tasks in Sprint 04 past due date",
                            positive: false,
                          },
                          {
                            delta: "-5",
                            labelAr: "اكتمال التوثيق (Documentation)",
                            labelEn: "Documentation",
                            detailAr:
                              "وثيقة اختبار الأداء بانتظار رفع النسخة المحدثة",
                            detailEn: "QA benchmark spec awaiting v3 upload",
                            positive: false,
                          },
                          {
                            delta: "-4",
                            labelAr: "ملاحظات المشرف (Feedback)",
                            labelEn: "Feedback",
                            detailAr:
                              "ملاحظة واحدة قيد المراجعة في الفصل الرابع",
                            detailEn: "1 supervisor annotation open in Ch. 4",
                            positive: false,
                          },
                          {
                            delta: "+9",
                            labelAr: "انضباط المراحل (Milestones)",
                            labelEn: "Milestones",
                            detailAr:
                              "تسليم المرحلة الأولى والثانية في الموعد المحدد",
                            detailEn: "Milestones 1 & 2 delivered on schedule",
                            positive: true,
                          },
                          {
                            delta: "+6",
                            labelAr: "تقدم الفريق (Team progress)",
                            labelEn: "Team progress",
                            detailAr: "معدل إنجاز أسبوعي منتظم لجميع الأعضاء",
                            detailEn:
                              "Consistent weekly velocity across all members",
                            positive: true,
                          },
                        ].map((factor) => (
                          <div
                            key={factor.labelEn}
                            className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3"
                            style={{
                              borderColor: palette.border,
                              backgroundColor: palette.elevated,
                            }}
                          >
                            <div>
                              <p
                                className="text-sm font-semibold"
                                style={{ color: palette.text }}
                              >
                                {isRtl ? factor.labelAr : factor.labelEn}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: palette.subtext }}
                              >
                                {isRtl ? factor.detailAr : factor.detailEn}
                              </p>
                            </div>
                            <span
                              className={`num-tabular shrink-0 rounded-lg px-3 py-1 font-mono text-sm font-bold ${
                                factor.positive
                                  ? "bg-[#163522] text-[#F3EACB]"
                                  : "bg-[#95542E] text-white"
                              }`}
                            >
                              {factor.delta}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ==========================================================
                    SECTION 11: NOTHING GETS LOST (CONTINUOUS GOLDEN LINE)
                    ========================================================== */}
                {sec.type === "CONTINUITY" && (
                  <div className="mx-auto max-w-5xl text-center">
                    <span className="sva-eyebrow">
                      {sec.eyebrow[locale]}
                    </span>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
                      “{sec.title[locale]}”
                    </h2>
                    <p
                      className="mx-auto mt-3 max-w-2xl text-base"
                      style={{ color: palette.subtext }}
                    >
                      {sec.subtitle[locale]}
                    </p>

                    <div className="relative mt-10">
                      <div className="hidden h-[2px] w-full bg-gradient-to-r from-[#98701E] via-[#C9A13C] to-[#B86A39] sm:block" />
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-5">
                        {[
                          {
                            ar: "١. الاجتماع",
                            en: "Meeting",
                            code: "MTG-06",
                            noteAr: "مناقشة اختيار بروتوكول MQTT للمستشعرات",
                            noteEn: "Discussed MQTT broker reliability",
                          },
                          {
                            ar: "٢. القرار",
                            en: "Decision",
                            code: "DEC-14",
                            noteAr: "اعتماد MQTT over TLS مع تخزين محلي مؤقت",
                            noteEn: "Adopted MQTT over TLS with edge buffer",
                          },
                          {
                            ar: "٣. المهمة",
                            en: "Task",
                            code: "TSK-119",
                            noteAr: "برمجة طبقة التشفير وإعادة الاتصال التلقائي",
                            noteEn: "Implemented TLS broker retry worker",
                          },
                          {
                            ar: "٤. الوثيقة",
                            en: "Document",
                            code: "DOC-V8",
                            noteAr: "توثيق المعمارية في الفصل الثالث من التقرير",
                            noteEn: "Documented in Chapter 3 Architecture Spec",
                          },
                          {
                            ar: "٥. المرحلة",
                            en: "Milestone",
                            code: "MS-03",
                            noteAr: "اجتياز مراجعة المرحلة الثالثة بنجاح",
                            noteEn: "Milestone 03 Gate Approved",
                          },
                        ].map((node, idx) => {
                          const active = activeContinuityNode === idx;
                          return (
                            <button
                              key={node.code}
                              type="button"
                              onClick={() => setActiveContinuityNode(idx)}
                              className="rounded-2xl border p-4 text-start transition-all"
                              style={{
                                backgroundColor: active
                                  ? "#163522"
                                  : palette.surface,
                                borderColor: active
                                  ? "#C9A13C"
                                  : palette.border,
                                color: active ? "#F2F4F1" : palette.text,
                              }}
                            >
                              <span className="font-mono text-xs font-bold text-[#C9A13C]">
                                {node.code}
                              </span>
                              <h3 className="mt-1 text-sm font-semibold">
                                {isRtl ? node.ar : node.en}
                              </h3>
                              <p
                                className="mt-2 text-xs leading-relaxed"
                                style={{
                                  color: active ? "#DBC477" : palette.subtext,
                                }}
                              >
                                {isRtl ? node.noteAr : node.noteEn}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ==========================================================
                    SECTION 12: TEAM COLLABORATION (OVERHEAD TEAM TABLE PHOTO)
                    ========================================================== */}
                {sec.type === "TEAM_COLLABORATION" &&
                  (() => {
                    const teamImg = resolveMedia(
                      sec.posterSlotId,
                      "/media/experience/landing-team-meetings.jpg"
                    );
                    return (
                      <div>
                        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                          <div className="lg:col-span-6">
                            <span className="sva-eyebrow">
                              {sec.eyebrow[locale]}
                            </span>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                              {sec.title[locale]}
                            </h2>
                            <p
                              className="mt-3 text-base"
                              style={{ color: palette.subtext }}
                            >
                              {sec.subtitle[locale]}
                            </p>
                          </div>

                          <div className="overflow-hidden rounded-2xl border border-[#C9A13C]/40 shadow-xl lg:col-span-6">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={teamImg.url}
                              alt={teamImg.alt}
                              className="h-56 w-full object-cover"
                            />
                          </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          {[
                            {
                              roleAr: "قائد الفريق (Team Leader)",
                              roleEn: "Team Leader",
                              name: "Omar Al-Masri",
                              flowAr:
                                "يدير المراحل، يوزع المهام، ويجهز حزم التسليم",
                              flowEn:
                                "Coordinates sprints, assigns tasks, seals packages",
                            },
                            {
                              roleAr: "مهندس الأنظمة والواجهات",
                              roleEn: "Systems & UI Engineer",
                              name: "Sara Khalid",
                              flowAr:
                                "تنفذ المهام البرمجية وترفع مخرجات الاختبار",
                              flowEn:
                                "Executes sprint tasks and links QA artifacts",
                            },
                            {
                              roleAr: "باحث الذكاء الاصطناعي والتوثيق",
                              roleEn: "Research & Documentation Lead",
                              name: "Lina Tareq",
                              flowAr:
                                "تحدث فصول التقرير النهائي وتعالج ملاحظات المشرف",
                              flowEn:
                                "Maintains Final Report v8 and resolves feedback",
                            },
                            {
                              roleAr: "المشرف الأكاديمي (Supervisor)",
                              roleEn: "Academic Supervisor",
                              name: "Dr. Khaled Mansour",
                              flowAr:
                                "يراجع المسودات، يضيف التوجيهات، ويعتمد التسليمات",
                              flowEn:
                                "Reviews chapters, logs annotations, approves gates",
                            },
                          ].map((member) => (
                            <div
                              key={member.name}
                              className="rounded-2xl border p-5"
                              style={{
                                backgroundColor: palette.surface,
                                borderColor: palette.border,
                              }}
                            >
                              <span className="font-mono text-xs font-semibold text-[#C9A13C]">
                                {isRtl ? member.roleAr : member.roleEn}
                              </span>
                              <h3 className="mt-2 text-base font-semibold">
                                {member.name}
                              </h3>
                              <p
                                className="mt-2 text-xs leading-relaxed"
                                style={{ color: palette.subtext }}
                              >
                                {isRtl ? member.flowAr : member.flowEn}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                {/* ==========================================================
                    SECTION 13: SUBMISSION PACKAGE
                    ========================================================== */}
                {sec.type === "SUBMISSION" && (
                  <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                      <span className="sva-eyebrow">
                        {sec.eyebrow[locale]}
                      </span>
                      <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                        {sec.title[locale]}
                      </h2>
                      <p
                        className="mt-3 text-base"
                        style={{ color: palette.subtext }}
                      >
                        {sec.subtitle[locale]}
                      </p>
                    </div>

                    <div className="lg:col-span-7">
                      <div
                        className="rounded-2xl border border-[#C9A13C]/45 p-6"
                        style={{
                          backgroundColor: palette.elevated,
                          color: palette.text,
                        }}
                      >
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {[
                            {
                              ar: "المهام المكتملة",
                              en: "Tasks",
                              val: "42 / 42",
                            },
                            {
                              ar: "الوثائق المعتمدة",
                              en: "Documents",
                              val: "v8 Locked",
                            },
                            {
                              ar: "موافقات المشرف",
                              en: "Approvals",
                              val: "Signed",
                            },
                            {
                              ar: "المراحل المنجزة",
                              en: "Milestones",
                              val: "4 / 4",
                            },
                          ].map((p) => (
                            <div
                              key={p.en}
                              className="rounded-xl border p-3 text-center"
                              style={{
                                borderColor: palette.border,
                                backgroundColor: palette.surface,
                              }}
                            >
                              <span
                                className="block font-mono text-[10px]"
                                style={{ color: palette.subtext }}
                              >
                                {isRtl ? p.ar : p.en}
                              </span>
                              <span className="mt-1 block font-mono text-xs font-bold text-[#C9A13C]">
                                {p.val}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 flex items-center justify-between rounded-xl border border-[#C9A13C] bg-[#163522] p-4">
                          <div className="flex items-center gap-3">
                            <PackageCheck className="h-6 w-6 text-[#C9A13C]" />
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {isRtl
                                  ? "حزمة التسليم النهائية — SCOP-2026-FINAL"
                                  : "Official Submission Package — SCOP-2026-FINAL"}
                              </p>
                              <p className="font-mono text-xs text-[#DBC477]">
                                Integrity Verified · Ready for Committee
                              </p>
                            </div>
                          </div>
                          <span className="rounded-full bg-[#C9A13C] px-3.5 py-1 font-mono text-xs font-bold text-[#07110A]">
                            READY
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ==========================================================
                    SECTION 14: DEFENSE SCENE (REAL AUDITORIUM TABLE PHOTO · 94% READY)
                    ========================================================== */}
                {sec.type === "DEFENSE_SCENE" &&
                  (() => {
                    const defenseImg = resolveMedia(
                      sec.posterSlotId,
                      "/media/experience/landing-defense-room.jpg"
                    );
                    return (
                      <div className="mx-auto max-w-6xl">
                        <div className="text-center">
                          <span className="sva-eyebrow">
                            {sec.eyebrow[locale]}
                          </span>
                          <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                            “{sec.title[locale]}”
                          </h2>
                          <p
                            className="mx-auto mt-4 max-w-2xl text-base"
                            style={{ color: palette.subtext }}
                          >
                            {sec.subtitle[locale]}
                          </p>
                        </div>

                        {/* Presentation Room Desk + Full-Width Cinematic Auditorium Photo */}
                        <div
                          className="mt-10 overflow-hidden rounded-3xl border border-[#C9A13C]/45 shadow-2xl"
                          style={{
                            backgroundColor: palette.elevated,
                          }}
                        >
                          <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={defenseImg.url}
                              alt={defenseImg.alt}
                              className="max-h-[460px] w-full object-cover"
                            />
                            <div className="inset-x-0 bottom-0 bg-gradient-to-t from-[#0D1C11] via-[#0D1C11]/75 to-transparent p-6 sm:absolute">
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                  <span className="font-mono text-xs uppercase tracking-widest text-[#DBC477]">
                                    {isRtl
                                      ? "طاولة العرض النهائي · قاعة المناقشة"
                                      : "FINAL DEFENSE PRESENTATION TABLE"}
                                  </span>
                                  <h3 className="mt-1 text-xl font-semibold text-[#F2F4F1]">
                                    {isRtl
                                      ? "كل أداة في مكانها قبل دخول اللجنة"
                                      : "Every physical & digital artifact aligned"}
                                  </h3>
                                </div>
                                <div className="rounded-2xl border border-[#C9A13C] bg-[#163522]/95 px-5 py-2.5 text-end shadow-xl">
                                  <span className="block font-mono text-[10px] uppercase tracking-wider text-[#DBC477]">
                                    {isRtl
                                      ? "جاهزية المناقشة"
                                      : "DEFENSE READINESS"}
                                  </span>
                                  <span className="num-tabular text-2xl font-bold text-white">
                                    Defense Ready 94%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-5">
                            {[
                              {
                                ar: "الحاسوب المحمول",
                                en: "Laptop",
                                subAr: "العرض والنظام الحي جاهزان",
                                subEn: "Live Demo & Deck Loaded",
                              },
                              {
                                ar: "التقرير النهائي المطبوع",
                                en: "Final Report",
                                subAr: "الإصدار الثامن المجلد",
                                subEn: "Hardbound Version 8",
                              },
                              {
                                ar: "وحدة التخزين الاحتياطية",
                                en: "Backup Drive",
                                subAr: "نسخة كاملة + فيديو مسجل",
                                subEn: "Offline Build + Demo Video",
                              },
                              {
                                ar: "جهاز التحكم بالعرض",
                                en: "Clicker",
                                subAr: "توقيت المتحدثين مضبوط",
                                subEn: "Speaker Slots Timed",
                              },
                              {
                                ar: "دفتر الملاحظات",
                                en: "Notebook",
                                subAr: "بنك إجابات أسئلة اللجنة",
                                subEn: "Committee Q&A Briefs",
                              },
                            ].map((item) => (
                              <div
                                key={item.en}
                                className="rounded-2xl border p-4"
                                style={{
                                  borderColor: palette.border,
                                  backgroundColor: palette.surface,
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <CheckCircle2 className="h-4 w-4 text-[#C9A13C]" />
                                  <span className="font-mono text-[10px] font-bold text-[#477C55]">
                                    READY
                                  </span>
                                </div>
                                <p
                                  className="mt-3 text-sm font-semibold"
                                  style={{ color: palette.text }}
                                >
                                  {isRtl ? item.ar : item.en}
                                </p>
                                <p
                                  className="mt-1 text-xs"
                                  style={{ color: palette.subtext }}
                                >
                                  {isRtl ? item.subAr : item.subEn}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                {/* ==========================================================
                    SECTION 15 & 16: FINAL MANIFESTO & QUIET CTA (ARCHITECTURAL CORRIDOR)
                    ========================================================== */}
                {sec.type === "MANIFESTO_CTA" &&
                  (() => {
                    const corridorImg = resolveMedia(
                      sec.posterSlotId,
                      "/media/experience/landing-manifesto-corridor.jpg"
                    );
                    return (
                      <div
                        className="relative mx-auto max-w-5xl overflow-hidden border p-8 text-center transition-colors duration-500 sm:p-16"
                        style={{
                          backgroundColor: palette.surface,
                          borderColor: leaf,
                        }}
                      >
                        <div className="pointer-events-none absolute inset-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={corridorImg.url}
                            alt={corridorImg.alt}
                            className={`h-full w-full object-cover ${
                              isDark ? "opacity-25" : "opacity-15"
                            }`}
                          />
                          <div
                            className="absolute inset-0"
                            style={{
                              background: isDark
                                ? "linear-gradient(180deg, rgba(11,15,12,0.85) 0%, rgba(16,22,18,0.95) 100%)"
                                : "linear-gradient(180deg, rgba(250,248,242,0.88) 0%, rgba(247,244,236,0.96) 100%)",
                            }}
                          />
                        </div>

                        <div className="relative z-10 mx-auto max-w-3xl">
                          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border p-2"
                            style={{
                              borderColor: leaf,
                              backgroundColor: palette.elevated,
                            }}
                          >
                            <Image
                              src="/brand/logo.png"
                              alt="SVA-DUATE Official Emblem"
                              width={48}
                              height={48}
                              unoptimized
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <span className="sva-eyebrow">
                            {sec.eyebrow[locale]}
                          </span>
                          <h2
                            className="mt-6 text-3xl sm:text-5xl"
                            style={{
                              color: palette.text,
                              fontFamily: isRtl
                                ? "var(--sva-display-arabic)"
                                : "var(--sva-display-latin)",
                            }}
                          >
                            “{sec.title[locale]}”
                          </h2>
                          <p
                            className="mx-auto mt-5 max-w-xl text-base leading-relaxed"
                            style={{
                              color: palette.subtext,
                              fontFamily: isRtl
                                ? undefined
                                : "var(--sva-display-latin)",
                              fontStyle: isRtl ? "normal" : "italic",
                              fontSize: isRtl ? "1.05rem" : "1.2rem",
                            }}
                          >
                            {sec.subtitle[locale]}
                          </p>

                          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                            <Link
                              href={
                                userContext?.isAuthenticated
                                  ? "/app"
                                  : sec.primaryCtaHref || "/login"
                              }
                              onClick={() =>
                                trackExperienceEvent(
                                  "start_project_clicked",
                                  { location: "manifesto_cta" },
                                  locale
                                )
                              }
                              className="sva-btn h-13 text-sm"
                              style={{
                                backgroundColor: ink,
                                color: isDark ? "#0B0F0C" : "#F1EDE3",
                                minHeight: 52,
                              }}
                            >
                              <span className="sva-btn-label px-7">
                                {sec.primaryCtaLabel?.[locale] ||
                                  (isRtl
                                    ? "ابدأ مشروعك"
                                    : "Start your project")}
                              </span>
                              <span className="sva-btn-tile w-13" style={{ width: 52 }}>
                                <ArrowRight className="h-4 w-4" style={{ color: leaf }} />
                              </span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
              </div>
            </section>

            {/* Index band — the material of a graduation project, typeset */}
            {sec.type === "HERO" && (
              <div
                className="border-b py-5"
                style={{
                  backgroundColor: isDark ? "#0B0F0C" : "#F1EDE3",
                  borderColor: palette.border,
                }}
                aria-hidden="true"
              >
                <div className="sva-marquee" dir="ltr">
                  <div className="sva-marquee-track">
                    {[0, 1].map((dup) => (
                      <React.Fragment key={dup}>
                        {(isRtl
                          ? [
                              "ميثاق المشروع",
                              "الدراسات السابقة",
                              "خارطة المراحل",
                              "وثيقة التصميم",
                              "محاضر الاجتماعات",
                              "ملاحظات المشرف",
                              "سجل القرارات",
                              "سجل المخاطر",
                              "التقرير النهائي",
                              "حزمة التسليم",
                              "يوم المناقشة",
                            ]
                          : [
                              "Project Charter",
                              "Literature Matrix",
                              "Milestone Roadmap",
                              "Architecture Spec",
                              "Meeting Minutes",
                              "Supervisor Notes",
                              "Decision Log",
                              "Risk Register",
                              "Final Report",
                              "Submission Package",
                              "Defense Day",
                            ]
                        ).map((w, i) => (
                          <span
                            key={`${dup}-${i}`}
                            className="inline-flex items-baseline gap-3"
                          >
                            <span
                              className="font-mono text-[10px]"
                              style={{ color: leaf }}
                            >
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span
                              className="text-2xl sm:text-3xl"
                              style={{
                                fontFamily: isRtl
                                  ? "var(--sva-display-arabic)"
                                  : "var(--sva-display-latin)",
                                fontStyle: !isRtl && i % 2 ? "italic" : "normal",
                                color: i % 2 ? palette.subtext : ink,
                              }}
                            >
                              {w}
                            </span>
                          </span>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}
            </React.Fragment>
          );
        })}
      </main>

      {/* ====================================================================
          17. EDITORIAL FOOTER & COLOPHON
          ==================================================================== */}
      <footer
        className="relative overflow-hidden border-t pt-16 pb-12 transition-colors"
        style={{
          backgroundColor: isDark ? "#0B0F0C" : "#ECE7DB",
          borderColor: isDark ? "#1F2A22" : "#D6CEBC",
          color: isDark ? "#979C90" : "#5A5A4E",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top row: Brand & Statement */}
          <div className="grid grid-cols-1 gap-12 border-b pb-14 lg:grid-cols-12"
            style={{ borderColor: isDark ? "#1A231D" : "#DDD5C4" }}
          >
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3">
                <Image
                  src="/brand/logo.png"
                  alt="SVA-DUATE"
                  width={36}
                  height={36}
                  unoptimized
                  className="h-9 w-9 object-contain"
                />
                <span
                  dir="ltr"
                  className="text-2xl leading-none"
                  style={{
                    fontFamily: "var(--sva-display-latin)",
                    letterSpacing: "-0.02em",
                    color: ink,
                  }}
                >
                  SVA<span className="italic" style={{ color: leaf }}>—duate</span>
                </span>
              </div>
              <p
                className="mt-5 max-w-sm text-sm leading-relaxed"
                style={{
                  fontFamily: isRtl ? undefined : "var(--sva-display-latin)",
                  fontStyle: isRtl ? "normal" : "italic",
                  fontSize: isRtl ? "0.95rem" : "1.08rem",
                  color: isDark ? "#979C90" : "#5A5A4E",
                }}
              >
                {isRtl
                  ? "من الفكرة الأولى والميثاق وحتى منصة المناقشة وقرار اللجنة."
                  : "From the initial charter to the final committee defense."}
              </p>
              <div className="mt-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em]">
                <span style={{ color: leaf }}>Edition MMXXVI</span>
                <span>·</span>
                <span>Academic Core</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.26em]" style={{ color: leaf }}>
                  01 · {isRtl ? "المحطات" : "Stations"}
                </p>
                <ul className="mt-4 space-y-2.5 text-xs">
                  <li>
                    <a href="#sec-01-hero" className="sva-link-underline hover:text-[#BF9A4A]">
                      {isRtl ? "نقطة البداية" : "The Beginning"}
                    </a>
                  </li>
                  <li>
                    <a href="#sec-03-journey" className="sva-link-underline hover:text-[#BF9A4A]">
                      {isRtl ? "خارطة المراحل" : "Milestone Roadmap"}
                    </a>
                  </li>
                  <li>
                    <a href="#sec-10-health" className="sva-link-underline hover:text-[#BF9A4A]">
                      {isRtl ? "صحة المشروع" : "Project Health"}
                    </a>
                  </li>
                  <li>
                    <a href="#sec-14-defense" className="sva-link-underline hover:text-[#BF9A4A]">
                      {isRtl ? "مركز المناقشة" : "Defense Command"}
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.26em]" style={{ color: leaf }}>
                  02 · {isRtl ? "المنظومة" : "Artifacts"}
                </p>
                <ul className="mt-4 space-y-2.5 text-xs">
                  <li>
                    <a href="#sec-04-universe" className="sva-link-underline hover:text-[#BF9A4A]">
                      {isRtl ? "أبعاد النظام" : "System Universe"}
                    </a>
                  </li>
                  <li>
                    <a href="#sec-06-execution" className="sva-link-underline hover:text-[#BF9A4A]">
                      {isRtl ? "الدورات والمهام" : "Sprints & Tasks"}
                    </a>
                  </li>
                  <li>
                    <a href="#sec-08-feedback" className="sva-link-underline hover:text-[#BF9A4A]">
                      {isRtl ? "ملاحظات المشرف" : "Supervisor Review"}
                    </a>
                  </li>
                  <li>
                    <a href="#sec-09-documents" className="sva-link-underline hover:text-[#BF9A4A]">
                      {isRtl ? "مستودع الوثائق" : "Document Vault"}
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.26em]" style={{ color: leaf }}>
                  03 · {isRtl ? "الوصول" : "Access"}
                </p>
                <ul className="mt-4 space-y-2.5 text-xs">
                  <li>
                    <Link href="/login" className="sva-link-underline hover:text-[#BF9A4A]">
                      {isRtl ? "تسجيل الدخول" : "Sign in"}
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="sva-link-underline hover:text-[#BF9A4A]">
                      {isRtl ? "إنشاء حساب جديد" : "Register Account"}
                    </Link>
                  </li>
                  <li>
                    <Link href="/app" className="sva-link-underline hover:text-[#BF9A4A]">
                      {isRtl ? "مساحة العمل" : "Workspace Portal"}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Colophon & giant watermark */}
          <div className="pt-8">
            <div className="flex flex-col items-start justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.22em] sm:flex-row sm:items-center">
              <span>
                Typeset in Instrument Serif · Amiri · JetBrains Mono
              </span>
              <span>
                © MMXXVI SVA—DUATE · All rights reserved
              </span>
            </div>

            <div
              className="sva-wordmark-xl mt-6 select-none opacity-[0.055]"
              style={{ color: ink }}
              aria-hidden="true"
            >
              SVA—duate
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
