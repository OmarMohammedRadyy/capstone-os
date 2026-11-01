import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/session";
import { getProjectBySlug } from "@/server/services/projects";
import { calculateProjectHealth } from "@/server/services/health";
import { prisma } from "@/server/db/prisma";
import { Sidebar } from "@/components/navigation/sidebar";
import { TopBar } from "@/components/navigation/top-bar";
import { MobileNavWrapper } from "@/components/navigation/mobile-nav-wrapper";
import { FeedbackStatus, MilestoneStatus } from "@/generated/prisma";
import {
  GuideProvider,
  WelcomeAndCompletionModals,
  SpotlightOverlay,
  GuideCenterDrawer,
  OnboardingChecklist,
  ContextualHintBanner,
  type GuideUserRole,
} from "@/features/user-guide";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { slug } = await params;
  let projectData;
  try {
    projectData = await getProjectBySlug(slug, user);
  } catch {
    redirect("/app/projects");
  }

  const { project, membership } = projectData;

  const [
    openFeedbackCount,
    teamCount,
    milestonesCount,
    completedMilestonesCount,
    tasksCount,
    myTasksCount,
    sprintsCount,
    meetingsCount,
    documentsCount,
    decisionsCount,
    risksCount,
    submissionsCount,
    health,
  ] = await Promise.all([
    prisma.feedback.count({
      where: {
        projectId: project.id,
        status: { in: [FeedbackStatus.OPEN, FeedbackStatus.IN_PROGRESS] },
      },
    }),
    prisma.projectMember.count({
      where: { projectId: project.id, active: true },
    }),
    prisma.milestone.count({
      where: { projectId: project.id },
    }),
    prisma.milestone.count({
      where: { projectId: project.id, status: MilestoneStatus.COMPLETED },
    }),
    prisma.task.count({
      where: { projectId: project.id },
    }),
    prisma.task.count({
      where: {
        projectId: project.id,
        status: { not: "DONE" },
        assignees: { some: { userId: user.id } },
      },
    }),
    prisma.sprint.count({
      where: { projectId: project.id },
    }),
    prisma.meeting.count({
      where: { projectId: project.id },
    }),
    prisma.document.count({
      where: { projectId: project.id, archivedAt: null },
    }),
    prisma.decision.count({
      where: { projectId: project.id },
    }),
    prisma.risk.count({
      where: { projectId: project.id },
    }),
    prisma.submission.count({
      where: { projectId: project.id },
    }),
    calculateProjectHealth(project.id),
  ]);

  const effectiveRole = ((membership?.role || user.systemRole) as GuideUserRole) || "STUDENT";

  return (
    <Suspense fallback={null}>
      <GuideProvider
        userId={user.id}
        projectSlug={project.slug}
        userRole={effectiveRole}
        metrics={{
          teamCount,
          milestonesCount,
          completedMilestonesCount,
          tasksCount,
          myTasksCount,
          sprintsCount,
          meetingsCount,
          openFeedbackCount,
          documentsCount,
          decisionsCount,
          risksCount,
          submissionsCount,
          healthScore: health.score,
        }}
      >
        <div className="flex h-screen w-screen overflow-hidden bg-[var(--canvas)]">
          {/* Desktop Sidebar */}
          <Sidebar
            projectSlug={project.slug}
            projectTitle={project.title}
            projectCode={project.code}
            userRole={effectiveRole}
            openFeedbackCount={openFeedbackCount}
          />

          {/* Main App Content Area */}
          <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
            <TopBar
              user={{
                id: user.id,
                name: user.name,
                email: user.email,
              }}
              projectId={project.id}
              projectSlug={project.slug}
              projectCode={project.code}
            />

            <main className="flex-1 overflow-y-auto pb-20 md:pb-8 p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                <ContextualHintBanner />
                {children}
              </div>
            </main>
          </div>

          {/* Mobile Navigation */}
          <MobileNavWrapper projectSlug={project.slug} />

          {/* Interactive User Guide Layer */}
          <WelcomeAndCompletionModals />
          <SpotlightOverlay />
          <GuideCenterDrawer />
          <OnboardingChecklist />
        </div>
      </GuideProvider>
    </Suspense>
  );
}
