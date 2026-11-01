import { describe, it, expect } from "vitest";
import {
  canViewProject,
  canManageMembers,
  canManageProjectSettings,
  canCreateTask,
  canEditTask,
  canDeleteTask,
  canApproveMilestone,
  canAddSupervisorFeedback,
  canResolveFeedback,
  canVerifyFeedback,
  canFreezeSubmission,
} from "@/server/auth/permissions";
import { ProjectRole, SystemRole } from "@/generated/prisma";
import type { User, ProjectMember } from "@/generated/prisma";

describe("Permissions and RBAC unit tests", () => {
  const studentUser: User = {
    id: "usr-student-1",
    email: "student@example.edu",
    name: "Student One",
    passwordHash: "hash",
    systemRole: SystemRole.USER,
    locale: "en",
    theme: "SYSTEM",
    timezone: "Africa/Cairo",
    emailVerifiedAt: new Date(),
    isActive: true,
    lastProjectId: null,
    failedLogins: 0,
    lockedUntil: null,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const adminUser: User = {
    ...studentUser,
    id: "usr-admin-1",
    email: "admin@example.edu",
    systemRole: SystemRole.SYSTEM_ADMIN,
  };

  const activeMember: ProjectMember = {
    id: "mem-1",
    projectId: "proj-1",
    userId: studentUser.id,
    role: ProjectRole.STUDENT,
    responsibilityTitle: "Frontend",
    capacityPoints: 10,
    active: true,
    joinedAt: new Date(),
    leftAt: null,
  };

  it("should restrict project viewing to members or admins", () => {
    expect(canViewProject(studentUser, null)).toBe(false);
    expect(canViewProject(studentUser, activeMember)).toBe(true);
    expect(canViewProject(adminUser, null)).toBe(true);
  });

  it("should restrict member and project settings management to Team Leader or Admin", () => {
    expect(canManageMembers(studentUser, ProjectRole.STUDENT)).toBe(false);
    expect(canManageMembers(studentUser, ProjectRole.SUPERVISOR)).toBe(false);
    expect(canManageMembers(studentUser, ProjectRole.TEAM_LEADER)).toBe(true);
    expect(canManageMembers(adminUser, null)).toBe(true);

    expect(canManageProjectSettings(studentUser, ProjectRole.STUDENT)).toBe(false);
    expect(canManageProjectSettings(studentUser, ProjectRole.TEAM_LEADER)).toBe(true);
  });

  it("should enforce task editing permissions by role and assignee status", () => {
    expect(canCreateTask(studentUser, ProjectRole.STUDENT)).toBe(true);
    expect(canCreateTask(studentUser, ProjectRole.SUPERVISOR)).toBe(false);

    expect(canEditTask(studentUser, ProjectRole.STUDENT, false)).toBe(false);
    expect(canEditTask(studentUser, ProjectRole.STUDENT, true)).toBe(true);
    expect(canEditTask(studentUser, ProjectRole.TEAM_LEADER, false)).toBe(true);

    expect(canDeleteTask(studentUser, ProjectRole.STUDENT)).toBe(false);
    expect(canDeleteTask(studentUser, ProjectRole.TEAM_LEADER)).toBe(true);
  });

  it("should enforce supervisor feedback and milestone approval workflows", () => {
    expect(canApproveMilestone(studentUser, ProjectRole.STUDENT)).toBe(false);
    expect(canApproveMilestone(studentUser, ProjectRole.SUPERVISOR)).toBe(true);

    expect(canAddSupervisorFeedback(studentUser, ProjectRole.STUDENT)).toBe(false);
    expect(canAddSupervisorFeedback(studentUser, ProjectRole.SUPERVISOR)).toBe(true);

    expect(canResolveFeedback(studentUser, ProjectRole.STUDENT)).toBe(true);
    expect(canVerifyFeedback(studentUser, ProjectRole.STUDENT)).toBe(false);
    expect(canVerifyFeedback(studentUser, ProjectRole.SUPERVISOR)).toBe(true);
  });

  it("should allow only Team Leaders to freeze submissions", () => {
    expect(canFreezeSubmission(studentUser, ProjectRole.STUDENT)).toBe(false);
    expect(canFreezeSubmission(studentUser, ProjectRole.SUPERVISOR)).toBe(false);
    expect(canFreezeSubmission(studentUser, ProjectRole.TEAM_LEADER)).toBe(true);
    expect(canFreezeSubmission(adminUser, null)).toBe(true);
  });
});
