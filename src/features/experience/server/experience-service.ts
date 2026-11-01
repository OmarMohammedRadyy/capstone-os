import { prisma } from "@/server/db/prisma";
import { DEFAULT_EXPERIENCE_CONFIG } from "../content/default-experience-config";
import {
  ExperiencePermission,
  ExperienceStudioPayload,
  ExperienceVersionItem,
  MediaAssetItem,
  PublishValidationIssue,
  PublishValidationReport,
  SiteExperienceConfig,
} from "../types/experience-types";

const KEY_PUBLISHED = "site_experience:published";
const KEY_DRAFT = "site_experience:draft";
const KEY_VERSIONS = "site_experience:versions";

export function resolveExperiencePermissions(
  systemRole: string,
  projectRole?: string | null
): ExperiencePermission[] {
  if (systemRole === "SYSTEM_ADMIN" || systemRole === "DEPARTMENT_ADMIN") {
    return ["BRANDING_VIEW", "BRANDING_EDIT", "BRANDING_PUBLISH", "MEDIA_MANAGE"];
  }
  if (projectRole === "TEAM_LEADER") {
    return ["BRANDING_VIEW", "BRANDING_EDIT", "BRANDING_PUBLISH", "MEDIA_MANAGE"];
  }
  if (systemRole === "SUPERVISOR" || projectRole === "SUPERVISOR" || projectRole === "CO_SUPERVISOR") {
    return ["BRANDING_VIEW", "BRANDING_EDIT"];
  }
  return ["BRANDING_VIEW"];
}

export function validateExperienceConfig(
  config: SiteExperienceConfig
): PublishValidationReport {
  const errors: PublishValidationIssue[] = [];
  const warnings: PublishValidationIssue[] = [];

  const enabledSections = config.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  if (enabledSections.length === 0) {
    errors.push({
      code: "NO_ENABLED_SECTIONS",
      severity: "ERROR",
      message: {
        ar: "يجب تفعيل قسم واحد على الأقل في صفحة الهبوط قبل النشر.",
        en: "At least one landing page section must be enabled before publishing.",
      },
    });
  }

  const heroSection = enabledSections.find((s) => s.type === "HERO");
  if (!heroSection) {
    errors.push({
      code: "HERO_DISABLED",
      severity: "ERROR",
      message: {
        ar: "المشهد الرئيسي (Hero Section) ضروري ولا يمكن إيقافه عند النشر.",
        en: "The Hero Section is required and cannot be disabled when publishing.",
      },
    });
  }

  // Validate bilingual titles & CTAs
  for (const sec of enabledSections) {
    if (!sec.title.ar.trim() || !sec.title.en.trim()) {
      errors.push({
        code: "MISSING_BILINGUAL_TITLE",
        severity: "ERROR",
        sectionId: sec.id,
        message: {
          ar: `العنوان العربي أو الإنجليزي مفقود في القسم (${sec.type}).`,
          en: `Missing Arabic or English headline in section (${sec.type}).`,
        },
      });
    }
    if (sec.primaryCtaHref && !sec.primaryCtaHref.startsWith("/") && !sec.primaryCtaHref.startsWith("#")) {
      errors.push({
        code: "INVALID_CTA_ROUTE",
        severity: "ERROR",
        sectionId: sec.id,
        message: {
          ar: `رابط الزر الرئيسي في (${sec.type}) يجب أن يبدأ بـ / أو #.`,
          en: `Primary CTA link in (${sec.type}) must start with / or #.`,
        },
      });
    }
  }

  // Check narrative sequence monotonicity (Chaos -> Structure -> Progress -> Control -> Submission -> Defense)
  let maxStageSeen = 0;
  for (const sec of enabledSections) {
    if (sec.narrativeStage < maxStageSeen) {
      warnings.push({
        code: "NARRATIVE_SEQUENCE_OUT_OF_ORDER",
        severity: "WARNING",
        sectionId: sec.id,
        message: {
          ar: `القسم "${sec.title.ar}" يسبق مرحلة سردية أحدث منه (الترتيب الموصى به: الفوضى ← الهيكلة ← التقدم ← التحكم ← التسليم ← المناقشة).`,
          en: `Section "${sec.title.en}" appears after a later narrative stage (Recommended arc: Chaos -> Structure -> Progress -> Control -> Submission -> Defense).`,
        },
      });
    } else {
      maxStageSeen = sec.narrativeStage;
    }
  }

  // Check Media size budgets
  for (const asset of config.mediaLibrary) {
    if (asset.actualSizeKb > asset.maxRecommendedSizeKb) {
      warnings.push({
        code: "MEDIA_BUDGET_EXCEEDED",
        severity: "WARNING",
        message: {
          ar: `حجم الملف (${asset.slotKey}: ${asset.actualSizeKb}KB) يتجاوز الميزانية الموصى بها (${asset.maxRecommendedSizeKb}KB).`,
          en: `Media asset (${asset.slotKey}: ${asset.actualSizeKb}KB) exceeds recommended budget (${asset.maxRecommendedSizeKb}KB).`,
        },
      });
    }
  }

  // Check SEO completeness
  if (!config.seo.title.ar.trim() || !config.seo.title.en.trim()) {
    errors.push({
      code: "SEO_TITLE_MISSING",
      severity: "ERROR",
      message: {
        ar: "عنوان الصفحة لمحركات البحث (SEO Title) مطلوب باللغتين العربية والإنجليزية.",
        en: "SEO Title is required in both Arabic and English.",
      },
    });
  }

  return {
    valid: errors.length === 0,
    canPublish: errors.length === 0,
    errors,
    warnings,
  };
}

function mergeWithDefaults(raw: unknown): SiteExperienceConfig {
  if (!raw || typeof raw !== "object") {
    return structuredClone(DEFAULT_EXPERIENCE_CONFIG);
  }
  const obj = raw as Partial<SiteExperienceConfig>;
  if ((obj.schemaVersion ?? 1) < DEFAULT_EXPERIENCE_CONFIG.schemaVersion) {
    return structuredClone(DEFAULT_EXPERIENCE_CONFIG);
  }
  return {
    schemaVersion: obj.schemaVersion ?? DEFAULT_EXPERIENCE_CONFIG.schemaVersion,
    updatedAt: obj.updatedAt ?? DEFAULT_EXPERIENCE_CONFIG.updatedAt,
    updatedByName: obj.updatedByName ?? DEFAULT_EXPERIENCE_CONFIG.updatedByName,
    splash: {
      ...DEFAULT_EXPERIENCE_CONFIG.splash,
      ...(obj.splash ?? {}),
    },
    tokens: {
      ...DEFAULT_EXPERIENCE_CONFIG.tokens,
      ...(obj.tokens ?? {}),
    },
    seo: {
      ...DEFAULT_EXPERIENCE_CONFIG.seo,
      ...(obj.seo ?? {}),
    },
    sections:
      Array.isArray(obj.sections) && obj.sections.length > 0
        ? obj.sections
        : structuredClone(DEFAULT_EXPERIENCE_CONFIG.sections),
    mediaLibrary:
      Array.isArray(obj.mediaLibrary) && obj.mediaLibrary.length > 0
        ? obj.mediaLibrary
        : structuredClone(DEFAULT_EXPERIENCE_CONFIG.mediaLibrary),
  };
}

export async function getPublishedExperienceConfig(): Promise<SiteExperienceConfig> {
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { key: KEY_PUBLISHED },
    });
    if (!record) {
      return structuredClone(DEFAULT_EXPERIENCE_CONFIG);
    }
    return mergeWithDefaults(record.value);
  } catch {
    return structuredClone(DEFAULT_EXPERIENCE_CONFIG);
  }
}

export async function getDraftExperienceConfig(): Promise<SiteExperienceConfig> {
  try {
    const draftRecord = await prisma.systemSetting.findUnique({
      where: { key: KEY_DRAFT },
    });
    if (draftRecord) {
      return mergeWithDefaults(draftRecord.value);
    }
    return await getPublishedExperienceConfig();
  } catch {
    return structuredClone(DEFAULT_EXPERIENCE_CONFIG);
  }
}

export async function getExperienceVersions(): Promise<ExperienceVersionItem[]> {
  try {
    const record = await prisma.systemSetting.findUnique({
      where: { key: KEY_VERSIONS },
    });
    if (!record || !Array.isArray(record.value)) {
      return [
        {
          versionId: "ver-initial-1",
          versionNumber: 1,
          label: "v1.0 — الإصدار المعماري القياسي SVA-DUATE (Baseline Quiet Luxury)",
          publishedAt: DEFAULT_EXPERIENCE_CONFIG.updatedAt,
          publishedByName: "SVA-DUATE System Architect",
          publishedByEmail: "admin@capstone.edu",
          notes: "النسخة التأسيسية لتجربة الدخول السينمائية وصفحة الهبوط التفاعلية لنظام SVA-DUATE.",
          configSnapshot: structuredClone(DEFAULT_EXPERIENCE_CONFIG),
        },
      ];
    }
    return record.value as unknown as ExperienceVersionItem[];
  } catch {
    return [];
  }
}

export async function getStudioPayload(
  systemRole: string,
  projectRole?: string | null
): Promise<ExperienceStudioPayload> {
  const [published, draft, versions] = await Promise.all([
    getPublishedExperienceConfig(),
    getDraftExperienceConfig(),
    getExperienceVersions(),
  ]);

  const permissions = resolveExperiencePermissions(systemRole, projectRole);
  const validation = validateExperienceConfig(draft);
  const hasUnsavedDraftDiff =
    JSON.stringify(published.sections) !== JSON.stringify(draft.sections) ||
    JSON.stringify(published.splash) !== JSON.stringify(draft.splash) ||
    JSON.stringify(published.tokens) !== JSON.stringify(draft.tokens) ||
    JSON.stringify(published.seo) !== JSON.stringify(draft.seo) ||
    JSON.stringify(published.mediaLibrary) !== JSON.stringify(draft.mediaLibrary);

  return {
    published,
    draft,
    hasUnsavedDraftDiff,
    versions,
    permissions,
    validation,
  };
}

export async function saveExperienceDraft(
  draftInput: SiteExperienceConfig,
  actor: { id: string; fullName: string; email: string }
): Promise<{ draft: SiteExperienceConfig; validation: PublishValidationReport }> {
  const normalized = mergeWithDefaults({
    ...draftInput,
    updatedAt: new Date().toISOString(),
    updatedByName: actor.fullName,
  });

  await prisma.systemSetting.upsert({
    where: { key: KEY_DRAFT },
    update: { value: JSON.parse(JSON.stringify(normalized)) },
    create: { key: KEY_DRAFT, value: JSON.parse(JSON.stringify(normalized)) },
  });

  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: "EXPERIENCE_DRAFT_SAVED",
      entityType: "system_settings",
      entityId: KEY_DRAFT,
      after: {
        updatedAt: normalized.updatedAt,
        sectionCount: normalized.sections.length,
      },
    },
  });

  return {
    draft: normalized,
    validation: validateExperienceConfig(normalized),
  };
}

export async function publishExperienceDraft(
  actor: { id: string; fullName: string; email: string },
  notes?: string
): Promise<{
  published: SiteExperienceConfig;
  version: ExperienceVersionItem;
  validation: PublishValidationReport;
}> {
  const draft = await getDraftExperienceConfig();
  const validation = validateExperienceConfig(draft);

  if (!validation.canPublish) {
    throw new Error("PUBLISH_VALIDATION_FAILED");
  }

  const now = new Date().toISOString();
  const publishedConfig: SiteExperienceConfig = {
    ...draft,
    updatedAt: now,
    updatedByName: actor.fullName,
  };

  const existingVersions = await getExperienceVersions();
  const nextVersionNumber =
    existingVersions.length > 0
      ? Math.max(...existingVersions.map((v) => v.versionNumber)) + 1
      : 1;

  const newVersion: ExperienceVersionItem = {
    versionId: `ver-${Date.now()}`,
    versionNumber: nextVersionNumber,
    label: `v${nextVersionNumber}.0 — ${notes?.trim() || "تحديث منشور من استوديو الواجهة"}`,
    publishedAt: now,
    publishedByName: actor.fullName,
    publishedByEmail: actor.email,
    notes: notes?.trim() || "نشر ذري (Atomic Publish) بعد اجتياز فحص الجودة.",
    configSnapshot: structuredClone(publishedConfig),
  };

  const updatedVersions = [newVersion, ...existingVersions].slice(0, 25);

  await prisma.$transaction([
    prisma.systemSetting.upsert({
      where: { key: KEY_PUBLISHED },
      update: { value: JSON.parse(JSON.stringify(publishedConfig)) },
      create: { key: KEY_PUBLISHED, value: JSON.parse(JSON.stringify(publishedConfig)) },
    }),
    prisma.systemSetting.upsert({
      where: { key: KEY_DRAFT },
      update: { value: JSON.parse(JSON.stringify(publishedConfig)) },
      create: { key: KEY_DRAFT, value: JSON.parse(JSON.stringify(publishedConfig)) },
    }),
    prisma.systemSetting.upsert({
      where: { key: KEY_VERSIONS },
      update: { value: JSON.parse(JSON.stringify(updatedVersions)) },
      create: { key: KEY_VERSIONS, value: JSON.parse(JSON.stringify(updatedVersions)) },
    }),
    prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "EXPERIENCE_PUBLISHED",
        entityType: "system_settings",
        entityId: KEY_PUBLISHED,
        after: {
          versionId: newVersion.versionId,
          versionNumber: newVersion.versionNumber,
          label: newVersion.label,
        },
      },
    }),
  ]);

  return {
    published: publishedConfig,
    version: newVersion,
    validation,
  };
}

export async function rollbackExperienceToVersion(
  versionId: string,
  actor: { id: string; fullName: string; email: string }
): Promise<SiteExperienceConfig> {
  const versions = await getExperienceVersions();
  const target = versions.find((v) => v.versionId === versionId);
  if (!target) {
    throw new Error("VERSION_NOT_FOUND");
  }

  const restored: SiteExperienceConfig = {
    ...mergeWithDefaults(target.configSnapshot),
    updatedAt: new Date().toISOString(),
    updatedByName: `${actor.fullName} (استعادة v${target.versionNumber}.0)`,
  };

  await prisma.$transaction([
    prisma.systemSetting.upsert({
      where: { key: KEY_PUBLISHED },
      update: { value: JSON.parse(JSON.stringify(restored)) },
      create: { key: KEY_PUBLISHED, value: JSON.parse(JSON.stringify(restored)) },
    }),
    prisma.systemSetting.upsert({
      where: { key: KEY_DRAFT },
      update: { value: JSON.parse(JSON.stringify(restored)) },
      create: { key: KEY_DRAFT, value: JSON.parse(JSON.stringify(restored)) },
    }),
    prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "EXPERIENCE_ROLLBACK",
        entityType: "system_settings",
        entityId: KEY_PUBLISHED,
        after: {
          restoredVersionId: versionId,
          restoredVersionNumber: target.versionNumber,
        },
      },
    }),
  ]);

  return restored;
}

export function getMediaAssetUsage(
  config: SiteExperienceConfig,
  assetId: string
): string[] {
  const usedIn: string[] = [];

  if (
    config.splash.desktopVideoSlotId === assetId ||
    config.splash.mobileVideoSlotId === assetId ||
    config.splash.posterSlotId === assetId
  ) {
    usedIn.push("Splash Screen");
  }

  if (config.seo.ogImageSlotId === assetId) {
    usedIn.push("SEO / OpenGraph Cover");
  }

  for (const sec of config.sections) {
    if (
      sec.videoSlotId === assetId ||
      sec.mobileVideoSlotId === assetId ||
      sec.posterSlotId === assetId
    ) {
      usedIn.push(`Section: ${sec.type}`);
    }
  }

  return usedIn;
}

export async function deleteMediaAssetFromDraft(
  assetId: string,
  actor: { id: string; fullName: string; email: string }
): Promise<SiteExperienceConfig> {
  const draft = await getDraftExperienceConfig();
  const target = draft.mediaLibrary.find((m) => m.id === assetId);
  if (!target) {
    throw new Error("MEDIA_ASSET_NOT_FOUND");
  }
  const usage = getMediaAssetUsage(draft, assetId);
  if (usage.length > 0) {
    throw new Error(`MEDIA_IN_USE:${usage.join(", ")}`);
  }

  const nextDraft: SiteExperienceConfig = {
    ...draft,
    mediaLibrary: draft.mediaLibrary.filter((m) => m.id !== assetId),
    updatedAt: new Date().toISOString(),
    updatedByName: actor.fullName,
  };

  await saveExperienceDraft(nextDraft, actor);
  return nextDraft;
}

export async function upsertMediaAssetInDraft(
  asset: MediaAssetItem,
  actor: { id: string; fullName: string; email: string }
): Promise<SiteExperienceConfig> {
  const draft = await getDraftExperienceConfig();
  const exists = draft.mediaLibrary.some((m) => m.id === asset.id);
  const nextMedia = exists
    ? draft.mediaLibrary.map((m) => (m.id === asset.id ? { ...asset, updatedAt: new Date().toISOString() } : m))
    : [...draft.mediaLibrary, { ...asset, updatedAt: new Date().toISOString() }];

  const nextDraft: SiteExperienceConfig = {
    ...draft,
    mediaLibrary: nextMedia,
    updatedAt: new Date().toISOString(),
    updatedByName: actor.fullName,
  };

  await saveExperienceDraft(nextDraft, actor);
  return nextDraft;
}
