"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  GuideActionEventName,
  GuideDefinition,
  GuidePersistenceState,
  GuideStep,
  GuideUserRole,
  WelcomeIntent,
  WorkspaceGuideMetrics,
} from "../types/guide-types";
import {
  GUIDE_CATALOG_VERSION,
  GUIDES_CATALOG,
} from "../content/guides-catalog";
import {
  GUIDE_ACTION_DOM_EVENT,
  GUIDE_START_DOM_EVENT,
  trackGuideAnalytics,
} from "../analytics/guide-analytics";

const DEFAULT_PERSISTENCE_STATE: GuidePersistenceState = {
  version: GUIDE_CATALOG_VERSION,
  welcomeSeen: false,
  activeGuideId: null,
  activeStepIndex: 0,
  pausedGuideId: null,
  pausedStepIndex: 0,
  completedGuides: [],
  dismissedHints: [],
  completedActions: [],
  checklistDismissed: false,
  checklistMinimized: true,
  updatedAt: new Date().toISOString(),
};

interface GuideContextValue {
  userId: string;
  projectSlug: string;
  userRole: GuideUserRole;
  metrics: WorkspaceGuideMetrics;
  state: GuidePersistenceState;
  isHydrated: boolean;

  // Modals & Drawers
  isWelcomeOpen: boolean;
  isGuideCenterOpen: boolean;
  isCompletionModalOpen: boolean;
  lastCompletedGuide: GuideDefinition | null;
  actionFeedbackMessage: string | null;

  // Active Tour
  activeGuide: GuideDefinition | null;
  activeSteps: GuideStep[];
  activeStep: GuideStep | null;
  activeStepIndex: number;
  pausedGuide: GuideDefinition | null;

  // Available Role-Filtered Guides
  availableGuides: GuideDefinition[];

  // Controls
  startGuide: (guideIdOrUri: string, stepIndex?: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipGuide: () => void;
  pauseGuide: () => void;
  resumePausedGuide: () => void;
  dismissPausedGuide: () => void;
  dismissHint: (hintId: string) => void;
  resetAllGuides: () => void;

  // UI Openers
  openGuideCenter: () => void;
  closeGuideCenter: () => void;
  openWelcomeModal: () => void;
  closeWelcomeModal: () => void;
  completeWelcome: (intent: WelcomeIntent, launchGuideId?: string) => void;
  closeCompletionModal: () => void;
  toggleChecklistMinimized: () => void;
  dismissChecklist: () => void;
  reopenChecklist: () => void;
  startPageGuideForCurrentRoute: () => void;
}

const GuideContext = createContext<GuideContextValue | undefined>(undefined);

export function GuideProvider({
  children,
  userId,
  projectSlug,
  userRole,
  metrics,
}: {
  children: React.ReactNode;
  userId: string;
  projectSlug: string;
  userRole: GuideUserRole;
  metrics: WorkspaceGuideMetrics;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const storageKey = `capstone_user_guide_v1:${userId}`;

  const [state, setState] = useState<GuidePersistenceState>(DEFAULT_PERSISTENCE_STATE);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isGuideCenterOpen, setIsGuideCenterOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [lastCompletedGuide, setLastCompletedGuide] = useState<GuideDefinition | null>(null);
  const [actionFeedbackMessage, setActionFeedbackMessage] = useState<string | null>(null);

  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter guides eligible for user's role
  const availableGuides = useMemo(() => {
    return GUIDES_CATALOG.filter((g) => {
      if (g.roles === "ALL") return true;
      return g.roles.includes(userRole);
    });
  }, [userRole]);

  // Persist helper (local + debounced server sync)
  const updateState = useCallback(
    (updater: (prev: GuidePersistenceState) => GuidePersistenceState) => {
      setState((prev) => {
        const next = {
          ...updater(prev),
          version: GUIDE_CATALOG_VERSION,
          updatedAt: new Date().toISOString(),
        };
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(storageKey, JSON.stringify(next));
          } catch {
            // Ignore localStorage quota errors
          }
        }
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(() => {
          fetch("/api/v1/user-guide/state", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state: next }),
          }).catch(() => {});
        }, 400);
        return next;
      });
    },
    [storageKey]
  );

  // Hydrate from localStorage + server on mount
  useEffect(() => {
    let localLoaded: GuidePersistenceState | null = null;
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) {
          const parsed: GuidePersistenceState = {
            ...DEFAULT_PERSISTENCE_STATE,
            ...JSON.parse(raw),
          };
          localLoaded = parsed;
          setState(parsed);
        }
      } catch {
        // Ignore parse error
      }
    }

    fetch("/api/v1/user-guide/state")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const remote = json?.data?.state as GuidePersistenceState | null;
        if (remote && typeof remote === "object") {
          const merged: GuidePersistenceState = {
            ...DEFAULT_PERSISTENCE_STATE,
            ...localLoaded,
            ...remote,
            completedGuides: Array.from(
              new Set([
                ...(localLoaded?.completedGuides || []),
                ...(remote.completedGuides || []),
              ])
            ),
            dismissedHints: Array.from(
              new Set([
                ...(localLoaded?.dismissedHints || []),
                ...(remote.dismissedHints || []),
              ])
            ),
            completedActions: Array.from(
              new Set([
                ...(localLoaded?.completedActions || []),
                ...(remote.completedActions || []),
              ])
            ),
          };
          setState(merged);
          try {
            window.localStorage.setItem(storageKey, JSON.stringify(merged));
          } catch {}
          if (!merged.welcomeSeen && !merged.activeGuideId) {
            setIsWelcomeOpen(true);
          }
        } else if (!localLoaded) {
          setIsWelcomeOpen(true);
        } else if (!localLoaded.welcomeSeen && !localLoaded.activeGuideId) {
          setIsWelcomeOpen(true);
        }
      })
      .catch(() => {
        if (!localLoaded || (!localLoaded.welcomeSeen && !localLoaded.activeGuideId)) {
          setIsWelcomeOpen(true);
        }
      })
      .finally(() => {
        setIsHydrated(true);
      });
  }, [storageKey]);

  const activeGuide = useMemo(() => {
    if (!state.activeGuideId) return null;
    return availableGuides.find((g) => g.id === state.activeGuideId) || null;
  }, [availableGuides, state.activeGuideId]);

  const activeSteps = useMemo(() => {
    if (!activeGuide) return [];
    return activeGuide.steps.filter((s) => {
      if (!s.roles || s.roles.length === 0) return true;
      return s.roles.includes(userRole);
    });
  }, [activeGuide, userRole]);

  const activeStep = useMemo(() => {
    if (!activeSteps.length) return null;
    return activeSteps[state.activeStepIndex] || activeSteps[0] || null;
  }, [activeSteps, state.activeStepIndex]);

  const pausedGuide = useMemo(() => {
    if (!state.pausedGuideId) return null;
    return availableGuides.find((g) => g.id === state.pausedGuideId) || null;
  }, [availableGuides, state.pausedGuideId]);

  // Start any guide by ID or `guide://` URI
  const startGuide = useCallback(
    (guideIdOrUri: string, stepIndex = 0) => {
      const cleanId = guideIdOrUri.replace(/^guide:\/\//, "").trim();
      const targetGuide = availableGuides.find((g) => g.id === cleanId);
      if (!targetGuide) return;

      const filteredSteps = targetGuide.steps.filter(
        (s) => !s.roles || s.roles.includes(userRole)
      );
      const firstStep = filteredSteps[stepIndex] || filteredSteps[0];
      if (!firstStep) return;

      const isReplay = state.completedGuides.includes(cleanId);
      trackGuideAnalytics(isReplay ? "guide_replayed" : "guide_started", {
        guideId: cleanId,
        role: userRole,
      });

      setIsGuideCenterOpen(false);
      setIsWelcomeOpen(false);
      setIsCompletionModalOpen(false);
      setActionFeedbackMessage(null);

      updateState((prev) => ({
        ...prev,
        welcomeSeen: true,
        activeGuideId: cleanId,
        activeStepIndex: stepIndex,
        pausedGuideId:
          prev.pausedGuideId === cleanId ? null : prev.pausedGuideId,
        pausedStepIndex:
          prev.pausedGuideId === cleanId ? 0 : prev.pausedStepIndex,
      }));

      const targetPath = `/app/p/${projectSlug}${firstStep.route}`;
      if (pathname !== targetPath) {
        router.push(targetPath);
      }
    },
    [availableGuides, pathname, projectSlug, router, state.completedGuides, updateState, userRole]
  );

  // Automatic cross-page navigation when activeStep route differs from current pathname
  useEffect(() => {
    if (!activeGuide || !activeStep) return;
    const expectedPath = `/app/p/${projectSlug}${activeStep.route}`;
    if (pathname !== expectedPath) {
      router.push(expectedPath);
    }
  }, [activeGuide, activeStep, pathname, projectSlug, router]);

  // Next step
  const nextStep = useCallback(() => {
    if (!activeGuide || !activeSteps.length) return;
    setActionFeedbackMessage(null);

    const nextIdx = state.activeStepIndex + 1;
    if (nextIdx < activeSteps.length) {
      trackGuideAnalytics("guide_step_viewed", {
        guideId: activeGuide.id,
        stepId: activeSteps[nextIdx]?.id,
        stepIndex: nextIdx,
        role: userRole,
      });

      updateState((prev) => ({
        ...prev,
        activeStepIndex: nextIdx,
      }));
    } else {
      // Tour Completed!
      trackGuideAnalytics("guide_completed", {
        guideId: activeGuide.id,
        role: userRole,
      });

      const finishedGuide = activeGuide;
      updateState((prev) => ({
        ...prev,
        activeGuideId: null,
        activeStepIndex: 0,
        pausedGuideId:
          prev.pausedGuideId === finishedGuide.id ? null : prev.pausedGuideId,
        completedGuides: Array.from(
          new Set([...prev.completedGuides, finishedGuide.id])
        ),
      }));

      setLastCompletedGuide(finishedGuide);
      setIsCompletionModalOpen(true);
    }
  }, [activeGuide, activeSteps, state.activeStepIndex, updateState, userRole]);

  // Previous step
  const prevStep = useCallback(() => {
    if (!activeGuide || state.activeStepIndex <= 0) return;
    setActionFeedbackMessage(null);
    updateState((prev) => ({
      ...prev,
      activeStepIndex: Math.max(0, prev.activeStepIndex - 1),
    }));
  }, [activeGuide, state.activeStepIndex, updateState]);

  // Skip guide ("تخطي دلوقتي")
  const skipGuide = useCallback(() => {
    if (!activeGuide) return;
    trackGuideAnalytics("guide_skipped", {
      guideId: activeGuide.id,
      stepIndex: state.activeStepIndex,
      role: userRole,
    });
    setActionFeedbackMessage(null);
    updateState((prev) => ({
      ...prev,
      activeGuideId: null,
      activeStepIndex: 0,
      pausedGuideId: activeGuide.id,
      pausedStepIndex: prev.activeStepIndex,
    }));
  }, [activeGuide, state.activeStepIndex, updateState, userRole]);

  // Pause guide (saves resume state: "نكمل من آخر حاجة وقفنا عندها؟")
  const pauseGuide = useCallback(() => {
    if (!activeGuide) return;
    setActionFeedbackMessage(null);
    updateState((prev) => ({
      ...prev,
      activeGuideId: null,
      activeStepIndex: 0,
      pausedGuideId: activeGuide.id,
      pausedStepIndex: prev.activeStepIndex,
    }));
  }, [activeGuide, updateState]);

  const resumePausedGuide = useCallback(() => {
    if (!state.pausedGuideId) return;
    trackGuideAnalytics("guide_resumed", {
      guideId: state.pausedGuideId,
      stepIndex: state.pausedStepIndex,
      role: userRole,
    });
    startGuide(state.pausedGuideId, state.pausedStepIndex);
  }, [startGuide, state.pausedGuideId, state.pausedStepIndex, userRole]);

  const dismissPausedGuide = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      pausedGuideId: null,
      pausedStepIndex: 0,
    }));
  }, [updateState]);

  const dismissHint = useCallback(
    (hintId: string) => {
      trackGuideAnalytics("contextual_hint_dismissed", {
        stepId: hintId,
        role: userRole,
      });
      updateState((prev) => ({
        ...prev,
        dismissedHints: Array.from(new Set([...prev.dismissedHints, hintId])),
      }));
    },
    [updateState, userRole]
  );

  // Listen for custom DOM events (Learning by Doing + Deep-Link triggers)
  useEffect(() => {
    const handleActionEvent = (e: Event) => {
      const custom = e as CustomEvent<{ action: GuideActionEventName }>;
      const actionName = custom.detail?.action;
      if (!actionName) return;

      updateState((prev) => ({
        ...prev,
        completedActions: Array.from(
          new Set([...prev.completedActions, actionName])
        ),
      }));

      if (activeStep && activeStep.waitForAction === actionName) {
        const msg =
          activeStep.successFeedbackAr ||
          "تمام جدًا! خطوة عملية ممتازة، يلا نكمل الخطوة اللي بعدها.";
        setActionFeedbackMessage(msg);
        trackGuideAnalytics("guide_step_completed", {
          guideId: activeGuide?.id,
          stepId: activeStep.id,
          role: userRole,
        });
      }
    };

    const handleStartEvent = (e: Event) => {
      const custom = e as CustomEvent<{ guideId: string }>;
      if (custom.detail?.guideId) {
        startGuide(custom.detail.guideId);
      }
    };

    window.addEventListener(GUIDE_ACTION_DOM_EVENT, handleActionEvent);
    window.addEventListener(GUIDE_START_DOM_EVENT, handleStartEvent);
    return () => {
      window.removeEventListener(GUIDE_ACTION_DOM_EVENT, handleActionEvent);
      window.removeEventListener(GUIDE_START_DOM_EVENT, handleStartEvent);
    };
  }, [activeGuide?.id, activeStep, startGuide, updateState, userRole]);

  // Support `?guide=tasks-workflow` URL deep links
  useEffect(() => {
    const qGuide = searchParams?.get("guide");
    if (qGuide && isHydrated) {
      startGuide(qGuide);
    }
  }, [isHydrated, searchParams, startGuide]);

  const completeWelcome = useCallback(
    (intent: WelcomeIntent, launchGuideId?: string) => {
      trackGuideAnalytics("welcome_intent_selected", {
        role: userRole,
        metadata: { intent, launchGuideId },
      });

      setIsWelcomeOpen(false);
      updateState((prev) => ({
        ...prev,
        welcomeSeen: true,
        selectedIntent: intent,
        checklistMinimized: false,
      }));

      if (launchGuideId) {
        startGuide(launchGuideId);
      }
    },
    [startGuide, updateState, userRole]
  );

  const resetAllGuides = useCallback(() => {
    updateState(() => ({
      ...DEFAULT_PERSISTENCE_STATE,
      welcomeSeen: true,
      checklistMinimized: false,
    }));
  }, [updateState]);

  const startPageGuideForCurrentRoute = useCallback(() => {
    const basePrefix = `/app/p/${projectSlug}`;
    const routeSuffix = pathname.startsWith(basePrefix)
      ? pathname.slice(basePrefix.length) || "/overview"
      : "/overview";

    const match =
      availableGuides.find(
        (g) => g.id !== "full-workflow" && g.startRoute === routeSuffix
      ) || availableGuides[0];

    if (match) {
      startGuide(match.id);
    } else {
      setIsGuideCenterOpen(true);
    }
  }, [availableGuides, pathname, projectSlug, startGuide]);

  const value = useMemo<GuideContextValue>(
    () => ({
      userId,
      projectSlug,
      userRole,
      metrics,
      state,
      isHydrated,
      isWelcomeOpen,
      isGuideCenterOpen,
      isCompletionModalOpen,
      lastCompletedGuide,
      actionFeedbackMessage,
      activeGuide,
      activeSteps,
      activeStep,
      activeStepIndex: state.activeStepIndex,
      pausedGuide,
      availableGuides,
      startGuide,
      nextStep,
      prevStep,
      skipGuide,
      pauseGuide,
      resumePausedGuide,
      dismissPausedGuide,
      dismissHint,
      resetAllGuides,
      openGuideCenter: () => setIsGuideCenterOpen(true),
      closeGuideCenter: () => setIsGuideCenterOpen(false),
      openWelcomeModal: () => setIsWelcomeOpen(true),
      closeWelcomeModal: () => {
        setIsWelcomeOpen(false);
        updateState((prev) => ({ ...prev, welcomeSeen: true }));
      },
      completeWelcome,
      closeCompletionModal: () => setIsCompletionModalOpen(false),
      toggleChecklistMinimized: () =>
        updateState((prev) => ({
          ...prev,
          checklistMinimized: !prev.checklistMinimized,
        })),
      dismissChecklist: () =>
        updateState((prev) => ({ ...prev, checklistDismissed: true })),
      reopenChecklist: () =>
        updateState((prev) => ({
          ...prev,
          checklistDismissed: false,
          checklistMinimized: false,
        })),
      startPageGuideForCurrentRoute,
    }),
    [
      actionFeedbackMessage,
      activeGuide,
      activeStep,
      activeSteps,
      availableGuides,
      completeWelcome,
      dismissHint,
      dismissPausedGuide,
      isCompletionModalOpen,
      isGuideCenterOpen,
      isHydrated,
      isWelcomeOpen,
      lastCompletedGuide,
      metrics,
      nextStep,
      pauseGuide,
      pausedGuide,
      prevStep,
      projectSlug,
      resetAllGuides,
      resumePausedGuide,
      skipGuide,
      startGuide,
      startPageGuideForCurrentRoute,
      state,
      updateState,
      userId,
      userRole,
    ]
  );

  return <GuideContext.Provider value={value}>{children}</GuideContext.Provider>;
}

export function useUserGuide(): GuideContextValue {
  const ctx = useContext(GuideContext);
  if (!ctx) {
    throw new Error("useUserGuide must be used within a GuideProvider");
  }
  return ctx;
}
