export type ExperiencePermission =
  | "BRANDING_VIEW"
  | "BRANDING_EDIT"
  | "BRANDING_PUBLISH"
  | "MEDIA_MANAGE";

export type LandingSectionType =
  | "HERO"
  | "CHAOS_TO_CONTROL"
  | "PROJECT_JOURNEY"
  | "PRODUCT_UNIVERSE"
  | "PLANNING"
  | "EXECUTION"
  | "MEETINGS_TO_ACTIONS"
  | "SUPERVISOR_FEEDBACK"
  | "DOCUMENTS"
  | "PROJECT_HEALTH"
  | "CONTINUITY"
  | "TEAM_COLLABORATION"
  | "SUBMISSION"
  | "DEFENSE_SCENE"
  | "MANIFESTO_CTA";

export type SectionLayoutVariant =
  | "CINEMATIC_CENTER"
  | "EDITORIAL_SPLIT_LEFT"
  | "EDITORIAL_SPLIT_RIGHT"
  | "ARCHITECTURAL_GRID"
  | "FULL_STAGE_DARK";

export type SectionBackgroundMode =
  | "DARK_FOREST"
  | "WARM_IVORY"
  | "FOREST_ELEVATED"
  | "AUTO_THEME";

export type MotionIntensityLevel = "LOW" | "BALANCED" | "CINEMATIC";

export interface BilingualText {
  ar: string;
  en: string;
}

export interface LandingSectionConfig {
  id: string;
  type: LandingSectionType;
  order: number;
  enabled: boolean;
  /** Canonical narrative stage (1..6: Chaos -> Structure -> Progress -> Control -> Submission -> Defense) */
  narrativeStage: 1 | 2 | 3 | 4 | 5 | 6;
  eyebrow: BilingualText;
  title: BilingualText;
  subtitle: BilingualText;
  highlightNote?: BilingualText;
  primaryCtaLabel?: BilingualText;
  primaryCtaHref?: string;
  secondaryCtaLabel?: BilingualText;
  secondaryCtaHref?: string;
  layoutVariant: SectionLayoutVariant;
  backgroundMode: SectionBackgroundMode;
  motionIntensity: MotionIntensityLevel;
  videoSlotId?: string;
  mobileVideoSlotId?: string;
  posterSlotId?: string;
  mobileStrategy: "INTERACTIVE_LIGHT" | "POSTER_FALLBACK" | "FULL_SCENE";
}

export interface SplashConfig {
  enabled: boolean;
  firstVisitDurationMs: number;
  recurringVisitEnabled: boolean;
  recurringDurationMs: number;
  skipThresholdMs: number;
  soundEnabled: boolean;
  motionIntensity: MotionIntensityLevel;
  lowMotionFallback: boolean;
  headline: BilingualText;
  subheadline: BilingualText;
  skipLabel: BilingualText;
  recurringMessages: {
    defaultReady: BilingualText;
    nextMilestone: BilingualText;
    attentionTasks: BilingualText;
  };
  desktopVideoSlotId: string;
  mobileVideoSlotId: string;
  posterSlotId: string;
}

export interface GlobalDesignTokensConfig {
  brandPreset: "QUIET_LUXURY_FOREST" | "DEEP_ACADEMIC_ARCHIVAL" | "WARM_EDITORIAL_STONE";
  forestPrimaryHex: string;
  goldAccentHex: string;
  copperAccentHex: string;
  defaultThemeMode: "DARK" | "LIGHT" | "SYSTEM";
  headingScaleMultiplier: number;
  sectionVerticalSpacingPx: number;
  cardBorderRadiusPx: number;
  globalMotionSpeedMultiplier: number;
  enableParallax: boolean;
}

export interface SeoConfig {
  title: BilingualText;
  description: BilingualText;
  ogImageSlotId: string;
  canonicalPath: string;
  keywords: string[];
  twitterCard: "summary_large_image" | "summary";
}

export type MediaAssetFormat = "webm" | "mp4" | "avif" | "webp" | "png" | "jpg" | "jpeg" | "svg";
export type MediaAssetCategory = "SPLASH" | "HERO" | "SECTION_VIDEO" | "POSTER" | "OG_SOCIAL" | "BRAND_LOGO";

export interface MediaAssetItem {
  id: string;
  slotKey: string;
  label: BilingualText;
  category: MediaAssetCategory;
  format: MediaAssetFormat;
  url: string;
  fallbackPosterUrl?: string;
  dimensions: string;
  maxRecommendedSizeKb: number;
  actualSizeKb: number;
  durationSeconds?: number;
  altText: BilingualText;
  isSystemDefault: boolean;
  updatedAt: string;
}

export interface SiteExperienceConfig {
  schemaVersion: number;
  updatedAt: string;
  updatedByName?: string;
  splash: SplashConfig;
  tokens: GlobalDesignTokensConfig;
  seo: SeoConfig;
  sections: LandingSectionConfig[];
  mediaLibrary: MediaAssetItem[];
}

export interface ExperienceVersionItem {
  versionId: string;
  versionNumber: number;
  label: string;
  publishedAt: string;
  publishedByName: string;
  publishedByEmail: string;
  notes?: string;
  configSnapshot: SiteExperienceConfig;
}

export interface PublishValidationIssue {
  code: string;
  severity: "ERROR" | "WARNING";
  message: BilingualText;
  sectionId?: string;
}

export interface PublishValidationReport {
  valid: boolean;
  canPublish: boolean;
  errors: PublishValidationIssue[];
  warnings: PublishValidationIssue[];
}

export interface ExperienceStudioPayload {
  published: SiteExperienceConfig;
  draft: SiteExperienceConfig;
  hasUnsavedDraftDiff: boolean;
  versions: ExperienceVersionItem[];
  permissions: ExperiencePermission[];
  validation: PublishValidationReport;
}

