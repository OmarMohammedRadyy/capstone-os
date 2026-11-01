import { ProjectRole, SystemRole } from "@/generated/prisma";
import type { User, ProjectMember } from "@/generated/prisma";

export interface ProjectContext {
  projectId: string;
  userRole?: ProjectRole | null;
  systemRole: SystemRole;
  isMember: boolean;
}

export function getProjectRole(
  user: User,
  memberships: ProjectMember[] = []
): ProjectRole | null {
  const member = memberships.find((m) => m.userId === user.id && m.active);
  return member ? member.role : null;
}

export function canViewProject(
  user: User,
  membership?: ProjectMember | null
): boolean {
  if (user.systemRole === SystemRole.SYSTEM_ADMIN || user.systemRole === SystemRole.DEPARTMENT_ADMIN) {
    return true;
  }
  return Boolean(membership && membership.active);
}

export function canManageMembers(
  user: User,
  role?: ProjectRole | null
): boolean {
  if (user.systemRole === SystemRole.SYSTEM_ADMIN || user.systemRole === SystemRole.DEPARTMENT_ADMIN) {
    return true;
  }
  return role === ProjectRole.TEAM_LEADER;
}

export function canManageProjectSettings(
  user: User,
  role?: ProjectRole | null
): boolean {
  if (user.systemRole === SystemRole.SYSTEM_ADMIN || user.systemRole === SystemRole.DEPARTMENT_ADMIN) {
    return true;
  }
  return role === ProjectRole.TEAM_LEADER;
}

export function canCreateTask(
  user: User,
  role?: ProjectRole | null
): boolean {
  if (user.systemRole === SystemRole.SYSTEM_ADMIN) return true;
  return role === ProjectRole.TEAM_LEADER || role === ProjectRole.STUDENT;
}

export function canEditTask(
  user: User,
  role?: ProjectRole | null,
  isAssignee: boolean = false
): boolean {
  if (user.systemRole === SystemRole.SYSTEM_ADMIN) return true;
  if (role === ProjectRole.TEAM_LEADER) return true;
  if (role === ProjectRole.STUDENT) return isAssignee;
  return false;
}

export function canDeleteTask(
  user: User,
  role?: ProjectRole | null
): boolean {
  if (user.systemRole === SystemRole.SYSTEM_ADMIN) return true;
  return role === ProjectRole.TEAM_LEADER;
}

export function canApproveMilestone(
  user: User,
  role?: ProjectRole | null
): boolean {
  if (user.systemRole === SystemRole.SYSTEM_ADMIN || user.systemRole === SystemRole.DEPARTMENT_ADMIN) {
    return true;
  }
  return role === ProjectRole.SUPERVISOR;
}

export function canRequestMilestoneApproval(
  user: User,
  role?: ProjectRole | null
): boolean {
  return role === ProjectRole.TEAM_LEADER || role === ProjectRole.STUDENT;
}

export function canAddSupervisorFeedback(
  user: User,
  role?: ProjectRole | null
): boolean {
  if (user.systemRole === SystemRole.SYSTEM_ADMIN || user.systemRole === SystemRole.DEPARTMENT_ADMIN) {
    return true;
  }
  return role === ProjectRole.SUPERVISOR;
}

export function canResolveFeedback(
  user: User,
  role?: ProjectRole | null
): boolean {
  return role === ProjectRole.STUDENT || role === ProjectRole.TEAM_LEADER;
}

export function canVerifyFeedback(
  user: User,
  role?: ProjectRole | null
): boolean {
  if (user.systemRole === SystemRole.SYSTEM_ADMIN || user.systemRole === SystemRole.DEPARTMENT_ADMIN) {
    return true;
  }
  return role === ProjectRole.SUPERVISOR;
}

export function canFreezeSubmission(
  user: User,
  role?: ProjectRole | null
): boolean {
  if (user.systemRole === SystemRole.SYSTEM_ADMIN || user.systemRole === SystemRole.DEPARTMENT_ADMIN) {
    return true;
  }
  return role === ProjectRole.TEAM_LEADER;
}

export function canManageDecisions(
  user: User,
  role?: ProjectRole | null
): boolean {
  if (user.systemRole === SystemRole.SYSTEM_ADMIN) return true;
  return role === ProjectRole.TEAM_LEADER || role === ProjectRole.STUDENT;
}

export function canManageRisks(
  user: User,
  role?: ProjectRole | null
): boolean {
  if (user.systemRole === SystemRole.SYSTEM_ADMIN) return true;
  return role === ProjectRole.TEAM_LEADER || role === ProjectRole.STUDENT;
}

