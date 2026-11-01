export type GuideUserRole =
  | "STUDENT"
  | "TEAM_LEADER"
  | "SUPERVISOR"
  | "DEPARTMENT_ADMIN"
  | "SYSTEM_ADMIN"
  | "USER";

export type WelcomeIntent = "explore_system" | "daily_work" | "lead_or_review";

export type GuideActionEventName =
  | "task.create.opened"
  | "task.created"
  | "task.selected"
  | "task.transitioned"
  | "milestone.selected"
  | "meeting.create.opened"
  | "meeting.created"
  | "feedback.selected"
  | "document.selected"
  | "decision.create.opened"
  | "risk.create.opened"
  | "health.recomputed"
  | "submission.selected"
  | "defense.updated";

export interface WorkspaceGuideMetrics {
  teamCount: number;
  milestonesCount: number;
  completedMilestonesCount: number;
  tasksCount: number;
  myTasksCount: number;
  sprintsCount: number;
  meetingsCount: number;
  openFeedbackCount: number;
  documentsCount: number;
  decisionsCount: number;
  risksCount: number;
  submissionsCount: number;
  healthScore: number;
}

export interface GuideStep {
  id: string;
  /** Route suffix under `/app/p/[slug]`, e.g. `/overview`, `/tasks`, `/roadmap` */
  route: string;
  /** Value of `data-guide="..."` attribute in the DOM. If omitted or not found, renders centered card safely. */
  target?: string;
  categoryAr: string;
  categoryEn: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  /** Optional dynamic content override based on live project data */
  getDynamicContentAr?: (metrics: WorkspaceGuideMetrics, role: GuideUserRole) => string;
  /** Explains the Why -> What -> Next Step connection */
  whyItMattersAr?: string;
  whyItMattersEn?: string;
  nextLogicalStepAr?: string;
  nextLogicalStepEn?: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
  /** Optional roles that should see this step; if omitted, all roles see it */
  roles?: GuideUserRole[];
  /** Optional Learning-by-Doing interactive prompt */
  actionPromptAr?: string;
  actionPromptEn?: string;
  /** Optional event name that auto-completes this step with positive feedback */
  waitForAction?: GuideActionEventName;
  successFeedbackAr?: string;
  successFeedbackEn?: string;
  /** Custom CTA label when the next step navigates to another page */
  nextButtonLabelAr?: string;
  nextButtonLabelEn?: string;
}

export interface GuideDefinition {
  id: string;
  /** Canonical deep link URI e.g. `guide://tasks-workflow` */
  deepLink: string;
  version: number;
  category: "core" | "planning" | "academic" | "governance" | "delivery";
  categoryLabelAr: string;
  categoryLabelEn: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  estimatedMinutes: number;
  /** Primary route suffix where this guide starts, e.g. `/tasks` */
  startRoute: string;
  roles: GuideUserRole[] | "ALL";
  keywords: string[];
  steps: GuideStep[];
}

export interface ContextualPageHint {
  id: string;
  /** Route suffix e.g. `/risks` */
  route: string;
  titleAr: string;
  titleEn: string;
  whyAr: string;
  whyEn: string;
  actionAr: string;
  actionEn: string;
  nextStepAr: string;
  nextStepEn: string;
  linkedGuideId: string;
  roles?: GuideUserRole[];
}

export interface WorkflowStageNode {
  id: string;
  number: number;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  practicalRuleAr: string;
  linkedGuideId: string;
  modules: Array<{
    nameAr: string;
    nameEn: string;
    route: string;
    guideId: string;
    summaryAr: string;
  }>;
}

export interface GuidePersistenceState {
  version: number;
  welcomeSeen: boolean;
  selectedIntent?: WelcomeIntent;
  activeGuideId: string | null;
  activeStepIndex: number;
  pausedGuideId: string | null;
  pausedStepIndex: number;
  completedGuides: string[];
  dismissedHints: string[];
  completedActions: string[];
  checklistDismissed: boolean;
   checklistMinimized: boolean;
  updatedAt: string;
}

export type GuideAnalyticsEventType =
  | "guide_started"
  | "guide_step_viewed"
  | "guide_step_completed"
  | "guide_skipped"
  | "guide_completed"
  | "guide_replayed"
  | "guide_dismissed"
  | "guide_resumed"
  | "contextual_hint_dismissed"
  | "welcome_intent_selected";

export interface GuideAnalyticsEvent {
  type: GuideAnalyticsEventType;
  guideId?: string;
  stepId?: string;
  stepIndex?: number;
  role?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

