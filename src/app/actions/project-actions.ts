"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getCurrentUser } from "@/server/auth/session";
import { login } from "@/server/services/auth";
import { AppError } from "@/server/lib/errors";
import {
  createProject,
  createProjectInvite,
  createProjectInviteWithCredentials,
  acceptProjectInvite,
  updateMemberRole,
  removeMember,
  updateProjectSettings,
  archiveProject,
  updateMemberDetails,
  assignProjectSupervisor,
  transferProjectLeadership,
  revokeProjectInvite,
  updateUserSystemRole,
  CreateProjectInput,
  UpdateProjectSettingsInput,
  UpdateMemberInput,
  CreateInviteWithCredentialsInput,
} from "@/server/services/projects";
import { ProjectRole, SystemRole } from "@/generated/prisma/enums";

export async function createProjectAction(input: CreateProjectInput) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  try {
    const project = await createProject(user, input);
    return { success: true, project };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create project" };
  }
}

export async function updateProjectSettingsAction(
  projectId: string,
  projectSlug: string,
  input: UpdateProjectSettingsInput
) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  try {
    const updated = await updateProjectSettings(user, projectId, input);
    revalidatePath(`/app/p/${projectSlug}/settings`);
    revalidatePath(`/app/p/${projectSlug}/overview`);
    return { success: true, project: updated };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update project settings" };
  }
}

export async function inviteMemberAction(
  projectId: string,
  projectSlug: string,
  email: string | null,
  role: ProjectRole
) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  try {
    const { invite, token } = await createProjectInvite(user, projectId, email, role);
    revalidatePath(`/app/p/${projectSlug}/settings`);
    return { success: true, invite, token };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create invitation" };
  }
}

export async function inviteMemberWithCredentialsAction(
  projectId: string,
  projectSlug: string,
  input: CreateInviteWithCredentialsInput
) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  try {
    const result = await createProjectInviteWithCredentials(user, projectId, input);
    revalidatePath(`/app/p/${projectSlug}/settings`);
    return {
      success: true as const,
      invite: result.invite,
      token: result.token,
      credentials: result.credentials,
    };
  } catch (err: any) {
    return {
      success: false as const,
      error: err.message || "فشل إنشاء الدعوة وتوليد بيانات الدخول",
    };
  }
}

export async function quickLoginAndAcceptInviteAction(token: string, email: string, pass: string) {
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "127.0.0.1";
  const userAgent = reqHeaders.get("user-agent") || "unknown";

  try {
    const { user } = await login(email, pass, ip, userAgent);
    const { project } = await acceptProjectInvite(user, token);

    revalidatePath(`/app/p/${project.slug}`);
    revalidatePath(`/app/p/${project.slug}/settings`);
    revalidatePath(`/app/projects`);

    return { success: true, projectSlug: project.slug, projectTitle: project.title };
  } catch (err: any) {
    return { success: false, error: err.message || "فشل تسجيل الدخول التلقائي وقبول الدعوة" };
  }
}

export async function acceptProjectInviteAction(token: string) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  try {
    const { project, membership } = await acceptProjectInvite(user, token);
    revalidatePath(`/app/p/${project.slug}`);
    revalidatePath(`/app/p/${project.slug}/settings`);
    revalidatePath(`/app/projects`);
    return { success: true, projectSlug: project.slug, projectTitle: project.title };
  } catch (err: any) {
    return { success: false, error: err.message || "فشل قبول الدعوة للانضمام" };
  }
}

export async function updateMemberRoleAction(
  projectId: string,
  projectSlug: string,
  targetUserId: string,
  newRole: ProjectRole,
  responsibilityTitle?: string,
  capacityPoints?: number
) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  try {
    const member = await updateMemberRole(
      user,
      projectId,
      targetUserId,
      newRole,
      responsibilityTitle,
      capacityPoints
    );
    revalidatePath(`/app/p/${projectSlug}/settings`);
    return { success: true, member };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update member" };
  }
}

export async function removeMemberAction(
  projectId: string,
  projectSlug: string,
  targetUserId: string
) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  try {
    await removeMember(user, projectId, targetUserId);
    revalidatePath(`/app/p/${projectSlug}/settings`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to remove member" };
  }
}

export async function archiveProjectAction(projectId: string, projectSlug: string) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  try {
    const project = await archiveProject(user, projectId);
    revalidatePath(`/app/p/${projectSlug}/settings`);
    return { success: true, project };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to archive project" };
  }
}

export async function updateMemberDetailsAction(
  projectId: string,
  projectSlug: string,
  targetUserId: string,
  input: UpdateMemberInput
) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  try {
    const member = await updateMemberDetails(user, projectId, targetUserId, input);
    revalidatePath(`/app/p/${projectSlug}/settings`);
    return { success: true, member };
  } catch (err: any) {
    return { success: false, error: err.message || "فشل تحديث بيانات وصلاحية العضو" };
  }
}

export async function assignProjectSupervisorAction(
  projectId: string,
  projectSlug: string,
  supervisorUserId: string
) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  try {
    const project = await assignProjectSupervisor(user, projectId, supervisorUserId);
    revalidatePath(`/app/p/${projectSlug}/settings`);
    return { success: true, project };
  } catch (err: any) {
    return { success: false, error: err.message || "فشل تعيين المشرف الأكاديمي للمشروع" };
  }
}

export async function transferLeadershipAction(
  projectId: string,
  projectSlug: string,
  newLeaderUserId: string,
  demoteCurrentLeader: boolean = true
) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  try {
    await transferProjectLeadership(user, projectId, newLeaderUserId, demoteCurrentLeader);
    revalidatePath(`/app/p/${projectSlug}/settings`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "فشل نقل تصدر الفريق" };
  }
}

export async function revokeProjectInviteAction(
  projectId: string,
  projectSlug: string,
  inviteId: string
) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  try {
    await revokeProjectInvite(user, projectId, inviteId);
    revalidatePath(`/app/p/${projectSlug}/settings`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "فشل إلغاء رابط الدعوة" };
  }
}

export async function updateUserSystemRoleAction(
  targetUserId: string,
  newSystemRole: SystemRole
) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  try {
    const updated = await updateUserSystemRole(user, targetUserId, newSystemRole);
    return { success: true, user: updated };
  } catch (err: any) {
    return { success: false, error: err.message || "فشل تعديل الدور النظامي للمستخدم" };
  }
}
