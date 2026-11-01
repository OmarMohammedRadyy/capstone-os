"use client";

import type {
  GuideActionEventName,
  GuideAnalyticsEvent,
  GuideAnalyticsEventType,
} from "../types/guide-types";

const ANALYTICS_STORAGE_KEY = "capstone_guide_analytics_v1";
export const GUIDE_ACTION_DOM_EVENT = "capstone:guide-action";
export const GUIDE_START_DOM_EVENT = "capstone:guide-start";

/**
 * Emits a real user action event (e.g., "task.created", "meeting.created")
 * so the Guide Engine can validate "Learning by Doing" steps without coupling
 * business logic to the guide state machine.
 */
export function emitGuideAction(
  action: GuideActionEventName,
  detail?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(GUIDE_ACTION_DOM_EVENT, {
      detail: { action, ...detail, timestamp: new Date().toISOString() },
    })
  );
}

/**
 * Triggers any guide by its ID or `guide://` URI from anywhere in the app.
 */
export function triggerGuide(guideIdOrUri: string): void {
  if (typeof window === "undefined") return;
  const cleanId = guideIdOrUri.replace(/^guide:\/\//, "").trim();
  window.dispatchEvent(
    new CustomEvent(GUIDE_START_DOM_EVENT, {
      detail: { guideId: cleanId },
    })
  );
}

/**
 * Records non-intrusive onboarding analytics events locally and optionally syncs with server.
 */
export function trackGuideAnalytics(
  type: GuideAnalyticsEventType,
  payload: Omit<GuideAnalyticsEvent, "type" | "timestamp"> = {}
): void {
  if (typeof window === "undefined") return;

  const event: GuideAnalyticsEvent = {
    type,
    ...payload,
    timestamp: new Date().toISOString(),
  };

  try {
    const raw = window.localStorage.getItem(ANALYTICS_STORAGE_KEY);
    const list: GuideAnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    const next = [...list.slice(-99), event];
    window.localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors
  }
}

export function getGuideAnalyticsSummary(): {
  totalStarted: number;
  totalCompleted: number;
  totalReplayed: number;
  recentEvents: GuideAnalyticsEvent[];
} {
  if (typeof window === "undefined") {
    return { totalStarted: 0, totalCompleted: 0, totalReplayed: 0, recentEvents: [] };
  }
  try {
    const raw = window.localStorage.getItem(ANALYTICS_STORAGE_KEY);
    const list: GuideAnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    return {
      totalStarted: list.filter((e) => e.type === "guide_started").length,
      totalCompleted: list.filter((e) => e.type === "guide_completed").length,
      totalReplayed: list.filter((e) => e.type === "guide_replayed").length,
      recentEvents: list.slice(-10).reverse(),
    };
  } catch {
    return { totalStarted: 0, totalCompleted: 0, totalReplayed: 0, recentEvents: [] };
  }
}

