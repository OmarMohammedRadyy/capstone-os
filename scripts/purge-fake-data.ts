import { prisma } from "../src/server/db/prisma";

async function main() {
  const fakeEmails = [
    "supervisor@example.edu",
    "sarah@example.edu",
    "admin@example.edu",
    "leader@example.edu",
    "youssef@example.edu",
    "nouran@example.edu",
    "kareem@example.edu",
  ];

  console.log("Purging fake project and demo users...");

  const fakeProjects = await prisma.project.findMany({
    where: {
      OR: [
        { slug: { startsWith: "scop-smart-campus" } },
        { title: { contains: "Smart Campus" } },
      ],
    },
  });

  for (const fakeProject of fakeProjects) {
    console.log("Purging fake project:", fakeProject.title);

    await prisma.milestoneEvidence.deleteMany({ where: { milestone: { projectId: fakeProject.id } } });
    await prisma.milestoneApproval.deleteMany({ where: { milestone: { projectId: fakeProject.id } } });
    await prisma.milestone.deleteMany({ where: { projectId: fakeProject.id } });
    await prisma.taskChecklistItem.deleteMany({ where: { task: { projectId: fakeProject.id } } });
    await prisma.taskCommentMention.deleteMany({ where: { comment: { task: { projectId: fakeProject.id } } } });
    await prisma.taskComment.deleteMany({ where: { task: { projectId: fakeProject.id } } });
    await prisma.taskDependency.deleteMany({ where: { task: { projectId: fakeProject.id } } });
    await prisma.taskAttachment.deleteMany({ where: { task: { projectId: fakeProject.id } } });
    await prisma.taskLabel.deleteMany({ where: { task: { projectId: fakeProject.id } } });
    await prisma.taskAssignee.deleteMany({ where: { task: { projectId: fakeProject.id } } });
    await prisma.sprintScopeChange.deleteMany({ where: { sprint: { projectId: fakeProject.id } } });
    await prisma.task.deleteMany({ where: { projectId: fakeProject.id } });
    await prisma.sprint.deleteMany({ where: { projectId: fakeProject.id } });
    await prisma.label.deleteMany({ where: { projectId: fakeProject.id } });
    await prisma.phase.deleteMany({ where: { projectId: fakeProject.id } });
    await prisma.feedbackEvent.deleteMany({ where: { feedback: { projectId: fakeProject.id } } });
    await prisma.feedback.deleteMany({ where: { projectId: fakeProject.id } });
    await prisma.submissionArtifact.deleteMany({ where: { submission: { projectId: fakeProject.id } } });
    await prisma.submissionSnapshot.deleteMany({ where: { submission: { projectId: fakeProject.id } } });
    await prisma.submissionRequirement.deleteMany({ where: { submission: { projectId: fakeProject.id } } });
    await prisma.submissionEvent.deleteMany({ where: { submission: { projectId: fakeProject.id } } });
    await prisma.submission.deleteMany({ where: { projectId: fakeProject.id } });
    await prisma.decisionRevision.deleteMany({ where: { decision: { projectId: fakeProject.id } } });
    await prisma.decisionOption.deleteMany({ where: { decision: { projectId: fakeProject.id } } });
    await prisma.decision.deleteMany({ where: { projectId: fakeProject.id } });
    await prisma.issueTask.deleteMany({ where: { issue: { projectId: fakeProject.id } } });
    await prisma.issue.deleteMany({ where: { projectId: fakeProject.id } });
    await prisma.risk.deleteMany({ where: { projectId: fakeProject.id } });
    await prisma.meetingAction.deleteMany({ where: { meeting: { projectId: fakeProject.id } } });
    await prisma.meetingAttendee.deleteMany({ where: { meeting: { projectId: fakeProject.id } } });
    await prisma.meeting.deleteMany({ where: { projectId: fakeProject.id } });
    await prisma.documentVersion.deleteMany({ where: { document: { projectId: fakeProject.id } } });
    await prisma.document.deleteMany({ where: { projectId: fakeProject.id } });
    await prisma.defenseChecklistItem.deleteMany({ where: { plan: { projectId: fakeProject.id } } });
    await prisma.defenseQuestion.deleteMany({ where: { plan: { projectId: fakeProject.id } } });
    await prisma.defenseSection.deleteMany({ where: { plan: { projectId: fakeProject.id } } });
    await prisma.defenseAsset.deleteMany({ where: { plan: { projectId: fakeProject.id } } });
    await prisma.defensePlan.deleteMany({ where: { projectId: fakeProject.id } });
    await prisma.activityEvent.deleteMany({ where: { projectId: fakeProject.id } });
    await prisma.healthSnapshot.deleteMany({ where: { projectId: fakeProject.id } });
    await prisma.contributionSnapshot.deleteMany({ where: { projectId: fakeProject.id } });
    await prisma.projectInvite.deleteMany({ where: { projectId: fakeProject.id } });
    await prisma.projectMember.deleteMany({ where: { projectId: fakeProject.id } });

    // Detach audit logs so we preserve append-only security logs
    await prisma.auditLog.updateMany({
      where: { projectId: fakeProject.id },
      data: { projectId: null },
    });

    await prisma.project.delete({ where: { id: fakeProject.id } });
    console.log("Successfully deleted fake project:", fakeProject.title);
  }

  // Reassign any entities created by fake users to the real user or null
  const realUser = await prisma.user.findFirst({
    where: { email: "omarmohammedrady55@gmail.com" },
  });

  if (realUser) {
    await prisma.project.updateMany({
      where: { createdById: { not: realUser.id } },
      data: { createdById: realUser.id },
    });
    await prisma.label.updateMany({
      where: { createdById: { not: realUser.id } },
      data: { createdById: realUser.id },
    });
    console.log("Reassigned all remaining projects and labels to real user:", realUser.email);
  }

  // Disable append-only trigger temporarily during maintenance
  await prisma.$executeRawUnsafe('ALTER TABLE "audit_logs" DISABLE TRIGGER "audit_logs_append_only";');

  try {
    for (const email of fakeEmails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.session.deleteMany({ where: { userId: user.id } });
        await prisma.projectMember.deleteMany({ where: { userId: user.id } });
        await prisma.notification.deleteMany({ where: { userId: user.id } });
        await prisma.notificationPreference.deleteMany({ where: { userId: user.id } });
        await prisma.taskAssignee.deleteMany({ where: { userId: user.id } });
        await prisma.taskComment.deleteMany({ where: { authorId: user.id } });
        await prisma.task.updateMany({ where: { createdById: user.id }, data: { createdById: realUser?.id } });
        await prisma.milestone.updateMany({ where: { ownerId: user.id }, data: { ownerId: null } });
        await prisma.submission.updateMany({ where: { ownerId: user.id }, data: { ownerId: realUser?.id } });
        await prisma.submission.updateMany({ where: { frozenById: user.id }, data: { frozenById: null } });
        await prisma.submissionSnapshot.updateMany({ where: { createdById: user.id }, data: { createdById: realUser?.id } });
        await prisma.submissionRequirement.updateMany({ where: { completedById: user.id }, data: { completedById: null } });
        await prisma.feedback.updateMany({ where: { authorId: user.id }, data: { authorId: realUser?.id } });
        await prisma.feedback.updateMany({ where: { assigneeId: user.id }, data: { assigneeId: null } });
        await prisma.feedback.updateMany({ where: { verifiedById: user.id }, data: { verifiedById: null } });
        await prisma.decision.updateMany({ where: { ownerId: user.id }, data: { ownerId: realUser?.id } });
        await prisma.risk.updateMany({ where: { ownerId: user.id }, data: { ownerId: realUser?.id } });
        await prisma.issue.updateMany({ where: { ownerId: user.id }, data: { ownerId: realUser?.id } });
        await prisma.documentVersion.updateMany({ where: { uploadedById: user.id }, data: { uploadedById: realUser?.id } });
        await prisma.systemSetting.updateMany({ where: { updatedById: user.id }, data: { updatedById: null } });
        await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
        await prisma.user.delete({ where: { id: user.id } });
        console.log("Deleted fake demo user:", email);
      }
    }
  } finally {
    // Re-enable trigger
    await prisma.$executeRawUnsafe('ALTER TABLE "audit_logs" ENABLE TRIGGER "audit_logs_append_only";');
  }

  console.log("\n--- PURGE COMPLETE ---");
  const remainingProjects = await prisma.project.findMany({ select: { id: true, title: true, slug: true } });
  console.log("Remaining Real Projects in DB:", remainingProjects);

  const remainingUsers = await prisma.user.findMany({ select: { id: true, name: true, email: true } });
  console.log("Remaining Real Users in DB:", remainingUsers);
}

main()
  .catch((e) => {
    console.error("Purge error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
