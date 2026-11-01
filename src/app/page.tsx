import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { getPublishedExperienceConfig } from "@/features/experience/server/experience-service";
import { CinematicLandingPage } from "@/features/experience/components/cinematic-landing-page";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getPublishedExperienceConfig();
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value === "en" ? "en" : "ar";

  const ogAsset = config.mediaLibrary.find(
    (m) => m.id === config.seo.ogImageSlotId
  );

  return {
    title: config.seo.title[locale],
    description: config.seo.description[locale],
    keywords: config.seo.keywords,
    openGraph: {
      title: config.seo.title[locale],
      description: config.seo.description[locale],
      images: ogAsset ? [ogAsset.url] : ["/brand/logo.png"],
    },
    twitter: {
      card: config.seo.twitterCard,
      title: config.seo.title[locale],
      description: config.seo.description[locale],
      images: ogAsset ? [ogAsset.url] : ["/brand/logo.png"],
    },
  };
}

export default async function HomePage() {
  const [config, user, cookieStore] = await Promise.all([
    getPublishedExperienceConfig(),
    getCurrentUser(),
    cookies(),
  ]);

  const initialLocale =
    cookieStore.get("NEXT_LOCALE")?.value === "en" ? "en" : "ar";
  const themeCookie = cookieStore.get("capstone_theme")?.value;
  const initialTheme =
    themeCookie === "light" || themeCookie === "dark" ? themeCookie : undefined;

  let attentionTasksCount = 0;
  let hasUpcomingMilestone = false;

  if (user) {
    try {
      const [tasksCount, milestoneCount] = await Promise.all([
        prisma.taskAssignee.count({
          where: {
            userId: user.id,
            task: {
              status: { in: ["READY", "IN_PROGRESS", "BLOCKED"] },
            },
          },
        }),
        prisma.milestone.count({
          where: {
            status: { in: ["NOT_STARTED", "ON_TRACK", "AT_RISK"] },
          },
        }),
      ]);
      attentionTasksCount = tasksCount;
      hasUpcomingMilestone = milestoneCount > 0;
    } catch {
      // Non-blocking fallback
    }
  }

  return (
    <CinematicLandingPage
      config={config}
      initialLocale={initialLocale}
      initialTheme={initialTheme}
      userContext={{
        isAuthenticated: Boolean(user),
        fullName: user?.name,
        attentionTasksCount,
        hasUpcomingMilestone,
      }}
    />
  );
}
