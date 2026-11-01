export type ExperienceAnalyticsEventName =
  | "landing_view"
  | "hero_cta_clicked"
  | "section_viewed"
  | "workflow_played"
  | "video_started"
  | "video_completed"
  | "start_project_clicked"
  | "login_clicked"
  | "splash_started"
  | "splash_skipped"
  | "splash_completed";

export interface ExperienceAnalyticsEventPayload {
  event: ExperienceAnalyticsEventName;
  timestamp: string;
  locale?: "ar" | "en";
  metadata?: Record<string, string | number | boolean | undefined>;
}

const SESSION_RING_BUFFER_KEY = "capstone_os_experience_events_v1";

export function trackExperienceEvent(
  event: ExperienceAnalyticsEventName,
  metadata?: Record<string, string | number | boolean | undefined>,
  locale?: "ar" | "en"
): void {
  if (typeof window === "undefined") return;

  const entry: ExperienceAnalyticsEventPayload = {
    event,
    timestamp: new Date().toISOString(),
    locale,
    metadata,
  };

  try {
    // Dispatch custom DOM event for live inspection in Studio or external telemetry hooks
    window.dispatchEvent(
      new CustomEvent("capstone:experience-analytics", { detail: entry })
    );

    const raw = window.sessionStorage.getItem(SESSION_RING_BUFFER_KEY);
    const list: ExperienceAnalyticsEventPayload[] = raw ? JSON.parse(raw) : [];
    list.push(entry);
    // Keep last 60 events in session ring buffer without blocking main thread
    if (list.length > 60) {
      list.splice(0, list.length - 60);
    }
    window.sessionStorage.setItem(SESSION_RING_BUFFER_KEY, JSON.stringify(list));
  } catch {
    // Non-blocking fail-safe if sessionStorage is restricted
  }
}

export function getRecentExperienceEvents(): ExperienceAnalyticsEventPayload[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(SESSION_RING_BUFFER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

