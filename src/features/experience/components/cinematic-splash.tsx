"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { MediaAssetItem, SplashConfig } from "../types/experience-types";
import { trackExperienceEvent } from "../analytics/experience-analytics";
import {
  FileText,
  CheckSquare,
  Calendar,
  Folder,
  BookOpen,
  GitBranch,
  MessageSquare,
  Presentation,
  Clock,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

const SPLASH_STORAGE_KEY = "sva_duate_splash_seen_v3";

export interface CinematicSplashProps {
  config: SplashConfig;
  mediaLibrary?: MediaAssetItem[];
  locale: "ar" | "en";
  /** Optional contextual status for authenticated returning users */
  userContext?: {
    isAuthenticated: boolean;
    fullName?: string;
    attentionTasksCount?: number;
    hasUpcomingMilestone?: boolean;
  };
  /** When used inside Landing & Splash Studio preview */
  studioPreviewMode?: "FIRST_VISIT" | "RECURRING" | "STATIC_FALLBACK" | null;
  onComplete?: () => void;
}

interface FloatingArtifact {
  id: string;
  labelAr: string;
  labelEn: string;
  meta: string;
  icon: React.ComponentType<{ className?: string }>;
  chaosX: number;
  chaosY: number;
  chaosRotate: number;
  gridX: number;
  gridY: number;
}

const PROJECT_ARTIFACTS: FloatingArtifact[] = [
  {
    id: "art-research",
    labelAr: "ورقة بحثية",
    labelEn: "Research Paper",
    meta: "IEEE_Ref_v2.pdf",
    icon: BookOpen,
    chaosX: -310,
    chaosY: -175,
    chaosRotate: -14,
    gridX: -260,
    gridY: -125,
  },
  {
    id: "art-task",
    labelAr: "بطاقة مهمة",
    labelEn: "Task Card",
    meta: "TSK-104 · API",
    icon: CheckSquare,
    chaosX: 295,
    chaosY: -185,
    chaosRotate: 12,
    gridX: 0,
    gridY: -125,
  },
  {
    id: "art-calendar",
    labelAr: "الجدول الزمني",
    labelEn: "Sprint Calendar",
    meta: "Week 08 · Sprint 4",
    icon: Calendar,
    chaosX: -355,
    chaosY: 25,
    chaosRotate: 9,
    gridX: 260,
    gridY: -125,
  },
  {
    id: "art-folder",
    labelAr: "مجلد المشروع",
    labelEn: "Repository Folder",
    meta: "/docs/architecture",
    icon: Folder,
    chaosX: 345,
    chaosY: 40,
    chaosRotate: -11,
    gridX: -260,
    gridY: 0,
  },
  {
    id: "art-doc",
    labelAr: "التقرير النهائي",
    labelEn: "Final Report",
    meta: "Version 8 · SHA256",
    icon: FileText,
    chaosX: -180,
    chaosY: 195,
    chaosRotate: -8,
    gridX: 0,
    gridY: 0,
  },
  {
    id: "art-diagram",
    labelAr: "مخطط النظام",
    labelEn: "System Diagram",
    meta: "Entity Topology",
    icon: GitBranch,
    chaosX: 225,
    chaosY: 185,
    chaosRotate: 15,
    gridX: 260,
    gridY: 0,
  },
  {
    id: "art-meeting",
    labelAr: "محضر اجتماع",
    labelEn: "Meeting Note",
    meta: "Action Item #12",
    icon: MessageSquare,
    chaosX: -275,
    chaosY: -70,
    chaosRotate: 16,
    gridX: -260,
    gridY: 125,
  },
  {
    id: "art-slide",
    labelAr: "شريحة المناقشة",
    labelEn: "Defense Slide",
    meta: "Deck · 94% Ready",
    icon: Presentation,
    chaosX: 165,
    chaosY: -110,
    chaosRotate: -13,
    gridX: 0,
    gridY: 125,
  },
  {
    id: "art-deadline",
    labelAr: "موعد التسليم",
    labelEn: "Milestone Gate",
    meta: "May 15 · Final",
    icon: Clock,
    chaosX: 15,
    chaosY: -215,
    chaosRotate: 7,
    gridX: 260,
    gridY: 125,
  },
];

const BONE = "#F4EFE6";
const LEAF = "#2D5A46";

function Wordmark({ size }: { size: "lg" | "md" }) {
  const letters = ["S", "V", "A"];
  const letters2 = ["D", "U", "A", "T", "E"];
  const fs =
    size === "lg"
      ? "clamp(3.4rem, 10vw, 8.5rem)"
      : "clamp(2.2rem, 6vw, 3.6rem)";
  return (
    <h1
      dir="ltr"
      className="flex items-baseline overflow-hidden leading-none"
      style={{
        fontFamily: "var(--sva-display-latin)",
        fontWeight: 400,
        fontSize: fs,
        letterSpacing: "-0.035em",
        color: BONE,
      }}
    >
      {letters.map((c, i) => (
        <span
          key={`a${i}`}
          className="sva-letter"
          style={{ transitionDelay: `${i * 55}ms` }}
        >
          {c}
        </span>
      ))}
      <span
        className="sva-letter mx-[0.12em] italic"
        style={{ color: LEAF, transitionDelay: "190ms" }}
      >
        —
      </span>
      {letters2.map((c, i) => (
        <span
          key={`b${i}`}
          className="sva-letter italic"
          style={{
            color: LEAF,
            transitionDelay: `${250 + i * 55}ms`,
          }}
        >
          {c}
        </span>
      ))}
    </h1>
  );
}

export function CinematicSplash({
  config,
  mediaLibrary,
  locale,
  userContext,
  studioPreviewMode = null,
  onComplete,
}: CinematicSplashProps) {
  const isRtl = locale === "ar";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const [visible, setVisible] = useState<boolean>(true);
  // Autoplay compliance: always begin muted so modern browsers don't block playback
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [viewportWidth, setViewportWidth] = useState<number>(1200);

  // Initialize mode safely without hydration mismatch
  const [mode, setMode] = useState<"FIRST_VISIT" | "RECURRING" | "STATIC">(() => {
    if (studioPreviewMode === "RECURRING") return "RECURRING";
    if (studioPreviewMode === "STATIC_FALLBACK") return "STATIC";
    if (studioPreviewMode === "FIRST_VISIT") return "FIRST_VISIT";
    return "FIRST_VISIT";
  });

  // Shot 1..6 for first-visit choreography
  const [shot, setShot] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [canSkip, setCanSkip] = useState<boolean>(false);

  // Track viewport width for responsive artifact coordinate translation
  useEffect(() => {
    if (typeof window === "undefined") return;
    setViewportWidth(window.innerWidth);
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const artifactScale = useMemo(() => {
    if (viewportWidth < 480) return 0.42;
    if (viewportWidth < 768) return 0.62;
    if (viewportWidth < 1024) return 0.82;
    return 1;
  }, [viewportWidth]);

  const splashVideoUrl = useMemo(() => {
    const found = mediaLibrary?.find(
      (m) => m.id === config.desktopVideoSlotId
    );
    return found?.url || "/media/experience/splash-intro-desktop.mp4";
  }, [config.desktopVideoSlotId, mediaLibrary]);

  const splashPosterUrl = useMemo(() => {
    const found = mediaLibrary?.find((m) => m.id === config.posterSlotId);
    return found?.url || "/media/experience/splash-intro-poster.png";
  }, [config.posterSlotId, mediaLibrary]);

  const recurringText = useMemo(() => {
    if (userContext?.attentionTasksCount && userContext.attentionTasksCount > 0) {
      return config.recurringMessages.attentionTasks[locale];
    }
    if (userContext?.hasUpcomingMilestone) {
      return config.recurringMessages.nextMilestone[locale];
    }
    return config.recurringMessages.defaultReady[locale];
  }, [config.recurringMessages, locale, userContext]);

  // Handle URL override (?splash=1 or ?replay=1) and execution flow
  useEffect(() => {
    if (!config.enabled && !studioPreviewMode) {
      setVisible(false);
      onCompleteRef.current?.();
      return;
    }

    const searchParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const isForceSplash =
      searchParams?.get("splash") === "1" ||
      searchParams?.get("replay") === "1";

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (studioPreviewMode) {
      if (studioPreviewMode === "STATIC_FALLBACK") {
        setMode("STATIC");
        setShot(5);
        return;
      }
      if (studioPreviewMode === "RECURRING") {
        setMode("RECURRING");
        setShot(5);
        return;
      }
      setMode("FIRST_VISIT");
      setShot(1);
    } else {
      if (prefersReducedMotion && config.lowMotionFallback) {
        setMode("STATIC");
        const t = setTimeout(() => {
          setVisible(false);
          onCompleteRef.current?.();
        }, 900);
        return () => clearTimeout(t);
      }

      const seenBefore =
        !isForceSplash &&
        typeof window !== "undefined" &&
        window.localStorage.getItem(SPLASH_STORAGE_KEY) === "1";

      if (seenBefore) {
        if (!config.recurringVisitEnabled) {
          setVisible(false);
          onCompleteRef.current?.();
          return;
        }
        setMode("RECURRING");
        trackExperienceEvent("splash_started", { mode: "RECURRING" }, locale);
        const dur = Math.min(Math.max(config.recurringDurationMs || 1150, 750), 1500);
        const t = setTimeout(() => {
          trackExperienceEvent("splash_completed", { mode: "RECURRING" }, locale);
          setVisible(false);
          onCompleteRef.current?.();
        }, dur);
        return () => clearTimeout(t);
      }
    }

    // First Visit Full 6-Shot Choreography synchronized with splash-intro-desktop.mp4
    trackExperienceEvent("splash_started", { mode: "FIRST_VISIT" }, locale);
    setMode("FIRST_VISIT");
    setShot(1);

    // Timings calibrated so Shot 5 (Brand Emblem + Slogan) has 2.4 seconds of clear presence:
    // Shot 1: 0ms -> 850ms (Point of origin / Spark)
    // Shot 2: 850ms -> 1900ms (Baseline ruler)
    // Shot 3: 1900ms -> 3300ms (Loose project artifacts / Chaos)
    // Shot 4: 3300ms -> 4600ms (Order & structural alignment)
    // Shot 5: 4600ms -> 7000ms (GRAND REVEAL: SVA-DUATE Emblem, Typography, Slogan)
    // Shot 6: 7000ms -> 7800ms (Opening portal wipe)
    // Done:   7800ms
    const skipTimer = setTimeout(() => setCanSkip(true), 1200);
    const t2 = setTimeout(() => setShot(2), 850);
    const t3 = setTimeout(() => setShot(3), 1900);
    const t4 = setTimeout(() => setShot(4), 3300);
    const t5 = setTimeout(() => setShot(5), 4600);
    const t6 = setTimeout(() => setShot(6), 7000);

    const tDone = setTimeout(() => {
      if (!studioPreviewMode) {
        if (!isForceSplash) {
          try {
            window.localStorage.setItem(SPLASH_STORAGE_KEY, "1");
          } catch {
            // ignore storage quota errors
          }
        }
        trackExperienceEvent("splash_completed", { mode: "FIRST_VISIT" }, locale);
        setVisible(false);
        onCompleteRef.current?.();
      }
    }, 7800);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(tDone);
    };
  }, [studioPreviewMode, locale, config.enabled, config.lowMotionFallback, config.recurringVisitEnabled, config.recurringDurationMs]);

  const handleSkip = () => {
    const searchParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const isForceSplash =
      searchParams?.get("splash") === "1" ||
      searchParams?.get("replay") === "1";

    if (!isForceSplash) {
      try {
        window.localStorage.setItem(SPLASH_STORAGE_KEY, "1");
      } catch {
        // ignore
      }
    }
    trackExperienceEvent("splash_skipped", { shot }, locale);

    // If user clicks skip early (shot 1..4), display Shot 5 (Logo & Slogan) clearly for 1.5s
    // so the brand reveal is never lost!
    if (shot < 5) {
      setShot(5);
      setTimeout(() => {
        setShot(6);
        setTimeout(() => {
          if (!studioPreviewMode) {
            setVisible(false);
          }
          onCompleteRef.current?.();
        }, 800);
      }, 1500);
    } else {
      setShot(6);
      setTimeout(() => {
        if (!studioPreviewMode) {
          setVisible(false);
        }
        onCompleteRef.current?.();
      }, 800);
    }
  };

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      if (!nextMuted) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // Visual-only: proof counter 000 → 100 synced with the 7.8s first-visit choreography
  const [proof, setProof] = useState<number>(0);
  useEffect(() => {
    if (mode !== "FIRST_VISIT") return;
    const totalMs = 7800;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / totalMs);
      setProof(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  if (!visible && !studioPreviewMode) return null;

  const INK = "#0B0F0C";
  const BONE = "#ECE8DD";
  const LEAF = "#BF9A4A";
  const MUTED = "#8E9488";

  const shotLabel = (
    [
      isRtl ? "نقطة البداية" : "The first mark",
      isRtl ? "خط القياس" : "The baseline",
      isRtl ? "عناصر المشروع" : "Loose material",
      isRtl ? "الانتظام" : "Set in order",
      isRtl ? "الإصدار" : "The edition",
      isRtl ? "فتح مساحة العمل" : "Opening",
    ] as const
  )[shot - 1];

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      role="dialog"
      aria-label={config.headline[locale]}
      className={`sva-splash ${
        studioPreviewMode
          ? "relative h-full w-full min-h-[540px]"
          : "fixed inset-0 z-[120]"
      } flex flex-col items-center justify-center overflow-hidden select-none`}
      style={{
        backgroundColor: INK,
        color: BONE,
        clipPath:
          shot === 6 && !studioPreviewMode
            ? "inset(50% 0 50% 0)"
            : "inset(0% 0 0% 0)",
        transition: "clip-path 800ms cubic-bezier(0.77, 0, 0.175, 1)",
      }}
    >
      {/* ------------------------------------------------------------------
          Backdrop: film plate, heavily toned so it reads as texture
          ------------------------------------------------------------------ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {mode === "FIRST_VISIT" ? (
          <video
            ref={videoRef}
            src={splashVideoUrl}
            poster={splashPosterUrl}
            autoPlay
            playsInline
            muted={isMuted}
            loop={Boolean(studioPreviewMode)}
            className="h-full w-full object-cover"
            onLoadedMetadata={() => {
              if (videoRef.current) {
                videoRef.current.play().catch(() => {});
              }
            }}
            style={{
              opacity: shot >= 5 ? 0.1 : 0.2,
              filter: "grayscale(0.65) contrast(1.1) sepia(0.2)",
              transition: "opacity 1.2s ease",
            }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={splashPosterUrl}
            alt=""
            className="h-full w-full object-cover"
            style={{
              opacity: 0.1,
              filter: "grayscale(0.7) sepia(0.2)",
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${INK} 0%, rgba(11,15,12,0.55) 30%, rgba(11,15,12,0.55) 70%, ${INK} 100%)`,
          }}
        />
      </div>

      {/* Column hairlines (12-col type grid) */}
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-6xl -translate-x-1/2 grid-cols-12 md:grid"
        aria-hidden="true"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="border-s"
            style={{
              borderColor: "rgba(191, 154, 74, 0.07)",
              transform:
                mode !== "FIRST_VISIT" || shot >= 2 ? "scaleY(1)" : "scaleY(0)",
              transformOrigin: i % 2 === 0 ? "top" : "bottom",
              transition: `transform 1.2s cubic-bezier(0.19,1,0.22,1) ${
                i * 40
              }ms`,
            }}
          />
        ))}
      </div>

      {/* Printer's crop marks */}
      {(["tl", "tr", "bl", "br"] as const).map((pos) => (
        <span
          key={pos}
          aria-hidden="true"
          className={`sva-crop ${pos} ${
            mode !== "FIRST_VISIT" || shot >= 1 ? "on" : ""
          }`}
        />
      ))}

      {/* Top folio */}
      <div className="absolute inset-x-0 top-7 z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-8 sm:px-16 font-mono text-[10px] uppercase tracking-[0.28em]">
        <span style={{ color: MUTED }}>
          {isRtl ? "إصدار أكاديمي" : "Academic Edition"} · MMXXVI
        </span>
        <span style={{ color: LEAF }}>
          {mode === "FIRST_VISIT"
            ? `№ ${String(proof).padStart(3, "0")}`
            : "№ 100"}
        </span>
      </div>

      {/* ==================================================================
          RECURRING — a quiet re-entry
          ================================================================== */}
      {mode === "RECURRING" && (
        <div className="sva-letters-on relative z-10 flex flex-col items-center px-6 text-center">
          <Image
            src="/brand/logo.png"
            alt="SVA-DUATE"
            width={44}
            height={44}
            unoptimized
            priority
            className="mb-6 h-11 w-11 object-contain opacity-90"
          />
          <Wordmark size="md" />
          <div className="mt-5 overflow-hidden">
            <p
              className="sva-rise max-w-md text-sm"
              style={{
                color: MUTED,
                animationDelay: "260ms",
                fontFamily: isRtl ? "var(--sva-display-arabic)" : undefined,
                fontSize: isRtl ? "1.05rem" : undefined,
              }}
            >
              {recurringText}
            </p>
          </div>
          <div
            className="mt-8 h-px w-48"
            style={{ backgroundColor: "rgba(191,154,74,0.18)" }}
          >
            <div
              className="sva-fill h-full w-full"
              style={
                {
                  backgroundColor: LEAF,
                  "--sva-fill-dur": `${Math.min(
                    Math.max(config.recurringDurationMs || 1150, 750),
                    1500
                  )}ms`,
                } as React.CSSProperties
              }
            />
          </div>
        </div>
      )}

      {/* ==================================================================
          STATIC — reduced motion
          ================================================================== */}
      {mode === "STATIC" && (
        <div className="sva-letters-on relative z-10 flex flex-col items-center px-6 text-center">
          <Image
            src="/brand/logo.png"
            alt="SVA-DUATE"
            width={52}
            height={52}
            unoptimized
            priority
            className="mb-6 h-13 w-13 object-contain"
          />
          <Wordmark size="md" />
          <p
            className="mt-4 text-sm"
            style={{
              color: MUTED,
              fontFamily: isRtl ? "var(--sva-display-arabic)" : undefined,
            }}
          >
            {config.subheadline[locale]}
          </p>
        </div>
      )}

      {/* ==================================================================
          FIRST VISIT — "Press Proof" in six shots
          ================================================================== */}
      {mode === "FIRST_VISIT" && (
        <div className="relative z-10 flex h-full w-full max-w-6xl flex-col items-center justify-center px-4 sm:px-6">
          {/* 01–02: a single mark, then the baseline is ruled */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              className="absolute"
              style={{
                width: 7,
                height: 7,
                backgroundColor: LEAF,
                opacity: shot <= 2 ? 1 : 0,
                transform: shot === 1 ? "scale(1)" : "scale(0.6)",
                transition: "all 600ms cubic-bezier(0.19,1,0.22,1)",
              }}
            />
            <span
              className="absolute h-px"
              style={{
                width: "min(84vw, 980px)",
                backgroundColor: LEAF,
                opacity: shot >= 2 && shot <= 4 ? 0.7 : shot >= 5 ? 0.25 : 0,
                transform: shot >= 2 ? "scaleX(1)" : "scaleX(0)",
                transition:
                  "transform 1.2s cubic-bezier(0.19,1,0.22,1), opacity 600ms ease",
              }}
            />
            {/* Baseline tick ruler */}
            <div
              className="absolute flex justify-between"
              style={{
                width: "min(84vw, 980px)",
                transform: "translateY(10px)",
                opacity: shot >= 2 && shot <= 4 ? 0.5 : 0,
                transition: "opacity 700ms ease 300ms",
              }}
            >
              {Array.from({ length: 25 }).map((_, i) => (
                <span
                  key={i}
                  className="w-px"
                  style={{
                    height: i % 4 === 0 ? 8 : 4,
                    backgroundColor: LEAF,
                  }}
                />
              ))}
            </div>
          </div>

          {/* 03–04: loose material, then set in order as an index (Fully responsive) */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
            {PROJECT_ARTIFACTS.map((item, idx) => {
              const isChaos = shot === 3;
              const isGrid = shot === 4;
              const tx = (isChaos ? item.chaosX : isGrid ? item.gridX : 0) * artifactScale;
              const ty = (isChaos ? item.chaosY : isGrid ? item.gridY * 0.9 : 0) * artifactScale;
              const rot = isChaos ? item.chaosRotate * 0.7 : 0;
              const opacity = shot < 3 || shot >= 5 ? 0 : 1;
              const cardWidth = viewportWidth < 640 ? "135px" : "195px";

              return (
                <div
                  key={item.id}
                  className="absolute text-start"
                  style={{
                    width: cardWidth,
                    transform: `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg)`,
                    opacity,
                    transition: `transform 900ms cubic-bezier(0.19,1,0.22,1) ${
                      idx * 25
                    }ms, opacity 500ms ease`,
                  }}
                >
                  <div
                    className="flex items-baseline gap-2.5 border-t pt-1.5 sm:pt-2 sm:gap-3"
                    style={{
                      borderColor: isGrid
                        ? "rgba(191,154,74,0.55)"
                        : "rgba(236,232,221,0.14)",
                      transition: "border-color 500ms ease",
                    }}
                  >
                    <span
                      className="font-mono text-[9px] sm:text-[10px]"
                      style={{ color: LEAF }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-[13px] leading-tight sm:text-[15px]"
                        style={{
                          color: BONE,
                          fontFamily: isRtl
                            ? "var(--sva-display-arabic)"
                            : "var(--sva-display-latin)",
                          fontStyle: !isRtl && isChaos ? "italic" : "normal",
                        }}
                      >
                        {isRtl ? item.labelAr : item.labelEn}
                      </p>
                      <p
                        className="mt-0.5 truncate font-mono text-[8.5px] uppercase tracking-wider sm:text-[9.5px]"
                        style={{
                          color: MUTED,
                          textDecoration: isChaos ? "line-through" : "none",
                          textDecorationColor: "rgba(168,98,58,0.8)",
                        }}
                      >
                        {item.meta}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 05–06: the edition */}
          <div
            className={`relative z-20 flex flex-col items-center text-center ${
              shot >= 5 ? "sva-letters-on" : ""
            }`}
          >
            <div
              style={{
                opacity: shot >= 5 ? 1 : 0,
                transform: shot >= 5 ? "none" : "translateY(10px)",
                transition: "all 900ms cubic-bezier(0.19,1,0.22,1)",
              }}
            >
              <Image
                src="/brand/logo.png"
                alt="SVA-DUATE Official Emblem"
                width={64}
                height={64}
                unoptimized
                priority
                className="mx-auto mb-7 h-16 w-16 object-contain"
              />
            </div>

            <Wordmark size="lg" />

            <div className="mt-6 overflow-hidden">
              <p
                className="max-w-lg"
                style={{
                  color: "#CFC8B6",
                  fontFamily: isRtl
                    ? "var(--sva-display-arabic)"
                    : "var(--sva-display-latin)",
                  fontStyle: isRtl ? "normal" : "italic",
                  fontSize: isRtl ? "1.25rem" : "1.2rem",
                  transform: shot >= 5 ? "none" : "translateY(110%)",
                  transition: "transform 1s cubic-bezier(0.19,1,0.22,1) 420ms",
                }}
              >
                {config.subheadline[locale]}
              </p>
            </div>
          </div>

          {/* Footer bar: shot index · hairline progress · smooth controls */}
          <div className="absolute inset-x-0 bottom-8 z-30 mx-auto flex w-full max-w-6xl items-center gap-4 sm:gap-6 px-6 sm:px-10">
            <span
              className="w-36 sm:w-44 shrink-0 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.24em]"
              style={{ color: MUTED }}
            >
              <span style={{ color: LEAF }}>0{shot}</span>
              <span className="mx-1.5 sm:mx-2">/</span>06 · {shotLabel}
            </span>

            <div
              className="relative h-px flex-1"
              style={{ backgroundColor: "rgba(236,232,221,0.12)" }}
            >
              <div
                className="absolute inset-y-0 start-0"
                style={{
                  width: `${proof}%`,
                  backgroundColor: LEAF,
                }}
              />
            </div>

            <div className="flex shrink-0 items-center gap-3 sm:gap-5 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.22em]">
              <button
                type="button"
                onClick={toggleSound}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-[#BF9A4A]"
                style={{ color: MUTED }}
                title={
                  isMuted
                    ? isRtl
                      ? "تشغيل الصوت"
                      : "Unmute"
                    : isRtl
                    ? "كتم الصوت"
                    : "Mute"
                }
              >
                {isMuted ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" style={{ color: LEAF }} />
                )}
                <span className="hidden sm:inline">
                  {isMuted ? (isRtl ? "صامت" : "Sound off") : isRtl ? "صوت" : "Sound on"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={!canSkip && !studioPreviewMode}
                className={`inline-flex items-center gap-1.5 sm:gap-2 border-b pb-0.5 transition-all duration-500 hover:text-[#BF9A4A] focus-visible:outline-2 focus-visible:outline-[#BF9A4A] ${
                  canSkip || studioPreviewMode
                    ? "opacity-100 pointer-events-auto translate-y-0"
                    : "opacity-0 pointer-events-none translate-y-1"
                }`}
                style={{ color: BONE, borderColor: LEAF }}
              >
                <span>{config.skipLabel[locale]}</span>
                <SkipForward className="h-3 w-3 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
