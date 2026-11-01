import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/lib/errors";
import { recordAuditLog } from "@/server/services/audit";
import { generateRandomToken, sha256, hashPassword } from "@/server/lib/crypto";
import { ProjectRole, ProjectStatus, PhaseStatus, PhaseProgressStrategy, SystemRole } from "@/generated/prisma";
import type { User, Project, ProjectMember, ProjectInvite } from "@/generated/prisma";

export interface CreateProjectInput {
  title: string;
  code: string;
  abstract?: string;
  academicYear: string;
  department: string;
  startDate: Date | string;
  endDate: Date | string;
  supervisorId?: string;
  createDefaultPhases?: boolean;
}

export const DEFAULT_GRADUATION_PHASES = [
  { name: "Idea & Proposal", order: 1 },
  { name: "Problem Definition & Analysis", order: 2 },
  { name: "Requirements & SRS", order: 3 },
  { name: "System Architecture & ERD", order: 4 },
  { name: "UI/UX & Prototyping", order: 5 },
  { name: "Implementation & Development", order: 6 },
  { name: "Testing & QA", order: 7 },
  { name: "Final Report & Documentation", order: 8 },
  { name: "Rehearsal & Pre-Defense", order: 9 },
  { name: "Final Defense", order: 10 },
];

function generateSlug(title: string, code: string): string {
  const base = `${code}-${title}`
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${randomSuffix}`;
}

export async function createProject(
  creator: User,
  input: CreateProjectInput
): Promise<Project> {
  const slug = generateSlug(input.title, input.code);

  const start = new Date(input.startDate);
  const end = new Date(input.endDate);

  if (end < start) {
    throw AppError.badRequest("End date cannot be earlier than start date.");
  }

  const project = await prisma.$transaction(async (tx) => {
    const p = await tx.project.create({
      data: {
        title: input.title.trim(),
        code: input.code.trim().toUpperCase(),
        slug,
        abstract: input.abstract?.trim(),
        academicYear: input.academicYear.trim(),
        department: input.department.trim(),
        startDate: start,
        endDate: end,
        createdById: creator.id,
        supervisorId: input.supervisorId || null,
        status: ProjectStatus.PLANNING,
      },
    });

    // Add creator as TEAM_LEADER
    await tx.projectMember.create({
      data: {
        projectId: p.id,
        userId: creator.id,
        role: ProjectRole.TEAM_LEADER,
        responsibilityTitle: "Team Lead",
      },
    });

    // Add supervisor as SUPERVISOR member if provided
    if (input.supervisorId && input.supervisorId !== creator.id) {
      await tx.projectMember.create({
        data: {
          projectId: p.id,
          userId: input.supervisorId,
          role: ProjectRole.SUPERVISOR,
          responsibilityTitle: "Academic Supervisor",
        },
      });
    }

    // Initialize Defense Plan
    await tx.defensePlan.create({
      data: {
        projectId: p.id,
      },
    });

    // Create default phases if requested
    if (input.createDefaultPhases !== false) {
      for (const phase of DEFAULT_GRADUATION_PHASES) {
        await tx.phase.create({
          data: {
            projectId: p.id,
            name: phase.name,
            order: phase.order,
            status: phase.order === 1 ? PhaseStatus.IN_PROGRESS : PhaseStatus.NOT_STARTED,
            progressStrategy: PhaseProgressStrategy.MILESTONES,
          },
        });
      }
    }

    // Default Labels
    const defaultLabels = [
      { name: "Frontend", color: "sky" },
      { name: "Backend", color: "indigo" },
      { name: "Database", color: "emerald" },
      { name: "Docs", color: "amber" },
      { name: "Bug", color: "rose" },
    ];
    for (const label of defaultLabels) {
      await tx.label.create({
        data: {
          projectId: p.id,
          name: label.name,
          color: label.color,
          createdById: creator.id,
        },
      });
    }

    return p;
  });

  await recordAuditLog({
    actorId: creator.id,
    action: "PROJECT_CREATED",
    entityType: "Project",
    entityId: project.id,
    projectId: project.id,
    after: { title: project.title, code: project.code, slug: project.slug },
  });

  return project;
}

export async function getProjectBySlug(
  slug: string,
  user: User
): Promise<{ project: Project; membership: ProjectMember | null }> {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, locale: true },
          },
        },
      },
      supervisor: {
        select: { id: true, name: true, email: true },
      },
      phases: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!project) {
    throw AppError.notFound("Project not found");
  }

  const membership = project.members.find((m) => m.userId === user.id && m.active) || null;

  // Authorization: must be a member or system/department admin
  if (!membership && user.systemRole !== "SYSTEM_ADMIN" && user.systemRole !== "DEPARTMENT_ADMIN") {
    throw AppError.forbidden("You do not have access to this project.");
  }

  return { project, membership };
}

export async function getUserProjects(user: User): Promise<Project[]> {
  if (user.systemRole === "SYSTEM_ADMIN") {
    return prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
    });
  }

  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id, active: true },
    include: { project: true },
    orderBy: { project: { updatedAt: "desc" } },
  });

  return memberships.map((m) => m.project);
}

export async function createProjectInvite(
  actor: User,
  projectId: string,
  email: string | null,
  role: ProjectRole,
  maxUses: number = 1
): Promise<{ invite: ProjectInvite; token: string }> {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: actor.id } },
  });

  if (
    (!member || member.role !== ProjectRole.TEAM_LEADER) &&
    actor.systemRole !== "SYSTEM_ADMIN" &&
    actor.systemRole !== "DEPARTMENT_ADMIN"
  ) {
    throw AppError.forbidden("Only team leaders or administrators can invite members.");
  }

  const rawToken = generateRandomToken(32);
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite = await prisma.projectInvite.create({
    data: {
      projectId,
      email: email ? email.trim().toLowerCase() : null,
      role,
      tokenHash,
      expiresAt,
      maxUses,
      createdById: actor.id,
    },
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "PROJECT_INVITE_CREATED",
    entityType: "ProjectInvite",
    entityId: invite.id,
    projectId,
    metadata: { role, email, maxUses },
  });

  return { invite, token: rawToken };
}

export interface CreateInviteWithCredentialsInput {
  email: string;
  name?: string;
  password?: string;
  role: ProjectRole;
  responsibilityTitle?: string;
  capacityPoints?: number;
}

export async function createProjectInviteWithCredentials(
  actor: User,
  projectId: string,
  input: CreateInviteWithCredentialsInput
): Promise<{
  invite: ProjectInvite;
  token: string;
  credentials: {
    email: string;
    password: string;
    name: string;
    isNewAccount: boolean;
  };
}> {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: actor.id } },
  });

  const isActorAdmin =
    actor.systemRole === "SYSTEM_ADMIN" || actor.systemRole === "DEPARTMENT_ADMIN";
  const isActorLeader = member?.role === ProjectRole.TEAM_LEADER && member.active;

  if (!isActorAdmin && !isActorLeader) {
    throw AppError.forbidden("Only team leaders or administrators can invite members.");
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw AppError.badRequest("Please provide a valid university email address.");
  }

  const plainPassword =
    input.password && input.password.trim().length >= 6
      ? input.password.trim()
      : `Cap@${Math.floor(1000 + Math.random() * 9000)}!`;

  const inviteeName: string = input.name?.trim() || normalizedEmail.split("@")[0] || "عضو جديد";

  let targetUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  let isNewAccount = false;

  if (!targetUser) {
    const passwordHash = await hashPassword(plainPassword);
    targetUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: inviteeName,
        passwordHash,
        locale: "ar",
      },
    });
    isNewAccount = true;

    await recordAuditLog({
      actorId: actor.id,
      action: "USER_PROVISIONED_BY_LEADER",
      entityType: "User",
      entityId: targetUser.id,
      projectId,
      metadata: { email: normalizedEmail, name: inviteeName, role: input.role },
    });
  } else if (input.password && input.password.trim().length >= 6) {
    // If leader provided a new password, update it so login with this password succeeds
    const passwordHash = await hashPassword(plainPassword);
    targetUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: { passwordHash },
    });
  }

  const rawToken = generateRandomToken(32);
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

  const invite = await prisma.projectInvite.create({
    data: {
      projectId,
      email: normalizedEmail,
      role: input.role,
      tokenHash,
      expiresAt,
      maxUses: 1,
      createdById: actor.id,
    },
  });

  // Pre-create or link membership so permissions and capacity are prepared
  if (targetUser) {
    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: targetUser.id } },
    });

    if (!existingMember) {
      await prisma.projectMember.create({
        data: {
          projectId,
          userId: targetUser.id,
          role: input.role,
          responsibilityTitle: input.responsibilityTitle || null,
          capacityPoints: input.capacityPoints ? Number(input.capacityPoints) : 30,
          active: true,
        },
      });
    } else {
      await prisma.projectMember.update({
        where: { id: existingMember.id },
        data: {
          role: input.role,
          active: true,
          leftAt: null,
          ...(input.responsibilityTitle && { responsibilityTitle: input.responsibilityTitle }),
          ...(input.capacityPoints && { capacityPoints: Number(input.capacityPoints) }),
        },
      });
    }
  }

  await recordAuditLog({
    actorId: actor.id,
    action: "PROJECT_INVITE_CREATED",
    entityType: "ProjectInvite",
    entityId: invite.id,
    projectId,
    metadata: {
      role: input.role,
      email: normalizedEmail,
      provisioned: isNewAccount,
      responsibilityTitle: input.responsibilityTitle,
    },
  });

  return {
    invite,
    token: rawToken,
    credentials: {
      email: normalizedEmail,
      password: plainPassword,
      name: targetUser.name,
      isNewAccount,
    },
  };
}

export async function acceptProjectInvite(
  user: User,
  token: string
): Promise<{ project: Project; membership: ProjectMember }> {
  const tokenHash = sha256(token);
  const invite = await prisma.projectInvite.findUnique({
    where: { tokenHash },
    include: { project: true },
  });

  if (!invite) {
    throw AppError.badRequest("Invalid invitation link.", "INVITE_INVALID");
  }

  if (invite.revokedAt || invite.expiresAt < new Date()) {
    throw AppError.badRequest("This invitation has expired or been revoked.", "INVITE_INVALID");
  }

  if (invite.useCount >= invite.maxUses) {
    throw AppError.badRequest("This invitation link has reached its maximum uses.", "INVITE_INVALID");
  }

  if (invite.email && invite.email !== user.email.toLowerCase()) {
    throw AppError.badRequest(
      `This invitation was addressed specifically to ${invite.email}. Please sign in with that email address.`,
      "FORBIDDEN"
    );
  }

  // Check if user is already a member
  const existingMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: invite.projectId, userId: user.id } },
  });

  if (existingMember && existingMember.active) {
    return { project: invite.project, membership: existingMember };
  }

  const result = await prisma.$transaction(async (tx) => {
    let membership: ProjectMember;

    if (existingMember && !existingMember.active) {
      // Reactivate
      membership = await tx.projectMember.update({
        where: { id: existingMember.id },
        data: { active: true, role: invite.role, leftAt: null },
      });
    } else {
      membership = await tx.projectMember.create({
        data: {
          projectId: invite.projectId,
          userId: user.id,
          role: invite.role,
        },
      });
    }

    await tx.projectInvite.update({
      where: { id: invite.id },
      data: { useCount: { increment: 1 } },
    });

    return { project: invite.project, membership };
  });

  await recordAuditLog({
    actorId: user.id,
    action: "PROJECT_INVITE_ACCEPTED",
    entityType: "ProjectMember",
    entityId: result.membership.id,
    projectId: invite.projectId,
    metadata: { role: invite.role },
  });

  return result;
}

export async function updateMemberRole(
  actor: User,
  projectId: string,
  targetUserId: string,
  newRole: ProjectRole,
  responsibilityTitle?: string,
  capacityPoints?: number
): Promise<ProjectMember> {
  const actorMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: actor.id } },
  });

  if (
    (!actorMember || actorMember.role !== ProjectRole.TEAM_LEADER) &&
    actor.systemRole !== "SYSTEM_ADMIN"
  ) {
    throw AppError.forbidden("Only team leaders can modify member roles.");
  }

  const target = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: targetUserId } },
  });

  if (!target || !target.active) {
    throw AppError.notFound("Project member not found.");
  }

  const updated = await prisma.projectMember.update({
    where: { id: target.id },
    data: {
      role: newRole,
      ...(responsibilityTitle !== undefined && { responsibilityTitle }),
      ...(capacityPoints !== undefined && { capacityPoints }),
    },
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "PROJECT_MEMBER_UPDATED",
    entityType: "ProjectMember",
    entityId: updated.id,
    projectId,
    before: { role: target.role, responsibilityTitle: target.responsibilityTitle },
    after: { role: updated.role, responsibilityTitle: updated.responsibilityTitle },
  });

  return updated;
}

export async function removeMember(
  actor: User,
  projectId: string,
  targetUserId: string
): Promise<void> {
  const actorMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: actor.id } },
  });

  if (
    (!actorMember || actorMember.role !== ProjectRole.TEAM_LEADER) &&
    actor.systemRole !== "SYSTEM_ADMIN"
  ) {
    throw AppError.forbidden("Only team leaders can remove members.");
  }

  if (actor.id === targetUserId) {
    throw AppError.badRequest("You cannot remove yourself as Team Leader.");
  }

  // Deactivate rather than deleting so historical tasks, contributions, and activity are preserved
  await prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId: targetUserId } },
    data: {
      active: false,
      leftAt: new Date(),
    },
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "PROJECT_MEMBER_REMOVED",
    entityType: "ProjectMember",
    entityId: targetUserId,
    projectId,
  });
}

export interface UpdateProjectSettingsInput {
  title?: string;
  abstract?: string;
  academicYear?: string;
  department?: string;
  timezone?: string;
  locale?: string;
  supervisorId?: string | null;
  weightSchedule?: number;
  weightTasks?: number;
  weightFeedback?: number;
  weightRisk?: number;
  weightReadiness?: number;
  weightWorkload?: number;
}

export async function updateProjectSettings(
  actor: User,
  projectId: string,
  input: UpdateProjectSettingsInput
): Promise<Project> {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: actor.id } },
  });

  if (
    (!member || member.role !== ProjectRole.TEAM_LEADER) &&
    actor.systemRole !== "SYSTEM_ADMIN"
  ) {
    throw AppError.forbidden("Only team leaders or administrators can update project settings.");
  }

  // Validate weights if provided
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  const wSched = input.weightSchedule !== undefined ? input.weightSchedule : project.weightSchedule;
  const wTasks = input.weightTasks !== undefined ? input.weightTasks : project.weightTasks;
  const wFeed = input.weightFeedback !== undefined ? input.weightFeedback : project.weightFeedback;
  const wRisk = input.weightRisk !== undefined ? input.weightRisk : project.weightRisk;
  const wRead = input.weightReadiness !== undefined ? input.weightReadiness : project.weightReadiness;
  const wWork = input.weightWorkload !== undefined ? input.weightWorkload : project.weightWorkload;

  const totalWeights = wSched + wTasks + wFeed + wRisk + wRead + wWork;
  if (totalWeights !== 100) {
    throw AppError.badRequest(
      `Health calculation weights must sum to exactly 100 (current sum: ${totalWeights}).`,
      "INVALID_WEIGHTS"
    );
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(input.title && { title: input.title.trim() }),
      ...(input.abstract !== undefined && { abstract: input.abstract?.trim() || null }),
      ...(input.academicYear && { academicYear: input.academicYear.trim() }),
      ...(input.department && { department: input.department.trim() }),
      ...(input.timezone && { timezone: input.timezone }),
      ...(input.locale && { locale: input.locale }),
      ...(input.supervisorId !== undefined && { supervisorId: input.supervisorId || null }),
      weightSchedule: wSched,
      weightTasks: wTasks,
      weightFeedback: wFeed,
      weightRisk: wRisk,
      weightReadiness: wRead,
      weightWorkload: wWork,
    },
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "PROJECT_SETTINGS_UPDATED",
    entityType: "Project",
    entityId: projectId,
    projectId,
    after: input,
  });

  return updated;
}

export async function archiveProject(
  actor: User,
  projectId: string
): Promise<Project> {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: actor.id } },
  });

  if (
    (!member || member.role !== ProjectRole.TEAM_LEADER) &&
    actor.systemRole !== "SYSTEM_ADMIN"
  ) {
    throw AppError.forbidden("Only team leaders or administrators can archive projects.");
  }

  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      statusBeforeArchive: project.status,
      status: ProjectStatus.ARCHIVED,
      archivedAt: new Date(),
    },
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "PROJECT_ARCHIVED",
    entityType: "Project",
    entityId: projectId,
    projectId,
  });

  return updated;
}

export interface UpdateMemberInput {
  role?: ProjectRole;
  responsibilityTitle?: string | null;
  capacityPoints?: number | null;
  active?: boolean;
}

export async function updateMemberDetails(
  actor: User,
  projectId: string,
  targetUserId: string,
  input: UpdateMemberInput
): Promise<ProjectMember> {
  const actorMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: actor.id } },
  });

  const isActorAdmin =
    actor.systemRole === "SYSTEM_ADMIN" || actor.systemRole === "DEPARTMENT_ADMIN";
  const isActorLeader = actorMember?.role === ProjectRole.TEAM_LEADER && actorMember.active;

  if (!isActorAdmin && !isActorLeader) {
    throw AppError.forbidden("Only team leaders or department administrators can modify member governance.");
  }

  const target = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: targetUserId } },
  });

  if (!target) {
    throw AppError.notFound("Project member not found.");
  }

  // Prevent self-deactivation if sole leader
  if (input.active === false && actor.id === targetUserId && target.role === ProjectRole.TEAM_LEADER) {
    throw AppError.badRequest("You cannot deactivate yourself as the active Team Leader. Transfer leadership first.");
  }

  const dataToUpdate: any = {};
  if (input.role !== undefined) dataToUpdate.role = input.role;
  if (input.responsibilityTitle !== undefined) {
    dataToUpdate.responsibilityTitle = input.responsibilityTitle ? input.responsibilityTitle.trim() : null;
  }
  if (input.capacityPoints !== undefined) {
    dataToUpdate.capacityPoints =
      input.capacityPoints !== null && input.capacityPoints !== undefined
        ? Number(input.capacityPoints)
        : null;
  }
  if (input.active !== undefined) {
    dataToUpdate.active = input.active;
    dataToUpdate.leftAt = input.active ? null : new Date();
  }

  const updated = await prisma.projectMember.update({
    where: { id: target.id },
    data: dataToUpdate,
    include: {
      user: {
        select: { id: true, name: true, email: true, systemRole: true },
      },
    },
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "PROJECT_MEMBER_UPDATED",
    entityType: "ProjectMember",
    entityId: updated.id,
    projectId,
    before: {
      role: target.role,
      responsibilityTitle: target.responsibilityTitle,
      capacityPoints: target.capacityPoints,
      active: target.active,
    },
    after: {
      role: updated.role,
      responsibilityTitle: updated.responsibilityTitle,
      capacityPoints: updated.capacityPoints,
      active: updated.active,
    },
  });

  return updated;
}

export async function assignProjectSupervisor(
  actor: User,
  projectId: string,
  supervisorUserId: string
): Promise<Project> {
  const actorMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: actor.id } },
  });

  const isActorAdmin =
    actor.systemRole === "SYSTEM_ADMIN" || actor.systemRole === "DEPARTMENT_ADMIN";
  const isActorLeader = actorMember?.role === ProjectRole.TEAM_LEADER && actorMember.active;

  if (!isActorAdmin && !isActorLeader) {
    throw AppError.forbidden("Only team leaders or administrators can assign the project supervisor.");
  }

  const supervisorUser = await prisma.user.findUnique({
    where: { id: supervisorUserId },
  });

  if (!supervisorUser) {
    throw AppError.notFound("Target supervisor user not found.");
  }

  const updatedProject = await prisma.$transaction(async (tx) => {
    const proj = await tx.project.update({
      where: { id: projectId },
      data: { supervisorId: supervisorUserId },
    });

    const existingMember = await tx.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: supervisorUserId } },
    });

    if (existingMember) {
      await tx.projectMember.update({
        where: { id: existingMember.id },
        data: {
          role: ProjectRole.SUPERVISOR,
          active: true,
          leftAt: null,
          responsibilityTitle: existingMember.responsibilityTitle || "المشرف الأكاديمي الرئيسي",
        },
      });
    } else {
      await tx.projectMember.create({
        data: {
          projectId,
          userId: supervisorUserId,
          role: ProjectRole.SUPERVISOR,
          responsibilityTitle: "المشرف الأكاديمي الرئيسي",
          active: true,
        },
      });
    }

    return proj;
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "PROJECT_SUPERVISOR_ASSIGNED",
    entityType: "Project",
    entityId: projectId,
    projectId,
    metadata: { supervisorId: supervisorUserId, supervisorName: supervisorUser.name },
  });

  return updatedProject;
}

export async function transferProjectLeadership(
  actor: User,
  projectId: string,
  newLeaderUserId: string,
  demoteCurrentLeader: boolean = true
): Promise<void> {
  const actorMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: actor.id } },
  });

  const isActorAdmin = actor.systemRole === "SYSTEM_ADMIN";
  const isActorLeader = actorMember?.role === ProjectRole.TEAM_LEADER && actorMember.active;

  if (!isActorAdmin && !isActorLeader) {
    throw AppError.forbidden("Only the current team leader or system administrator can transfer leadership.");
  }

  const newLeaderMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: newLeaderUserId } },
    include: { user: true },
  });

  if (!newLeaderMember || !newLeaderMember.active) {
    throw AppError.badRequest("The selected member must be an active project member.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.projectMember.update({
      where: { id: newLeaderMember.id },
      data: {
        role: ProjectRole.TEAM_LEADER,
        responsibilityTitle: newLeaderMember.responsibilityTitle || "متصدر الفريق (Team Leader)",
      },
    });

    if (demoteCurrentLeader && actorMember && actorMember.id !== newLeaderMember.id) {
      await tx.projectMember.update({
        where: { id: actorMember.id },
        data: {
          role: ProjectRole.STUDENT,
          responsibilityTitle: actorMember.responsibilityTitle || "عضو فريق سابق للمتصدر",
        },
      });
    }
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "PROJECT_LEADERSHIP_TRANSFERRED",
    entityType: "Project",
    entityId: projectId,
    projectId,
    metadata: {
      previousLeaderId: actor.id,
      newLeaderId: newLeaderUserId,
      demotedPrevious: demoteCurrentLeader,
    },
  });
}

export async function revokeProjectInvite(
  actor: User,
  projectId: string,
  inviteId: string
): Promise<void> {
  const actorMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: actor.id } },
  });

  const isActorAdmin =
    actor.systemRole === "SYSTEM_ADMIN" || actor.systemRole === "DEPARTMENT_ADMIN";
  const isActorLeader = actorMember?.role === ProjectRole.TEAM_LEADER && actorMember.active;

  if (!isActorAdmin && !isActorLeader) {
    throw AppError.forbidden("Only team leaders or administrators can revoke invitations.");
  }

  const invite = await prisma.projectInvite.findUnique({
    where: { id: inviteId },
  });

  if (!invite || invite.projectId !== projectId) {
    throw AppError.notFound("Invitation not found.");
  }

  await prisma.projectInvite.update({
    where: { id: inviteId },
    data: { revokedAt: new Date() },
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "PROJECT_INVITE_REVOKED",
    entityType: "ProjectInvite",
    entityId: inviteId,
    projectId,
    metadata: { email: invite.email, role: invite.role },
  });
}

export async function updateUserSystemRole(
  actor: User,
  targetUserId: string,
  newSystemRole: SystemRole
): Promise<User> {
  if (actor.systemRole !== "SYSTEM_ADMIN") {
    throw AppError.forbidden("Only a System Administrator can modify user system roles.");
  }

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) throw AppError.notFound("User not found.");

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { systemRole: newSystemRole },
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "USER_SYSTEM_ROLE_UPDATED",
    entityType: "User",
    entityId: targetUserId,
    before: { systemRole: target.systemRole },
    after: { systemRole: updated.systemRole },
  });

  return updated;
}


