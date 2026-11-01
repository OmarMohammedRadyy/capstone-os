"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/session";
import {
  createTask,
  updateTask,
  deleteTask,
  addChecklistItem,
  toggleChecklistItem,
  addTaskComment,
  addTaskDependency,
  removeTaskDependency,
} from "@/server/services/tasks";
import { TaskStatus, Priority } from "@/generated/prisma/enums";
import { AppError } from "@/server/lib/errors";

export async function createTaskAction(projectId: string, projectSlug: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || undefined;
  const status = (formData.get("status") as TaskStatus) || TaskStatus.BACKLOG;
  const priority = (formData.get("priority") as Priority) || Priority.MEDIUM;
  const points = formData.get("estimatePoints") ? Number(formData.get("estimatePoints")) : undefined;
  const dueAt = (formData.get("dueAt") as string) || null;
  const sprintId = (formData.get("sprintId") as string) || null;
  const milestoneId = (formData.get("milestoneId") as string) || null;
  const assigneeId = (formData.get("assigneeId") as string) || null;

  try {
    await createTask(user, {
      projectId,
      title,
      description,
      status,
      priority,
      estimatePoints: points,
      dueAt,
      sprintId,
      milestoneId,
      assigneeIds: assigneeId ? [assigneeId] : [],
    });

    revalidatePath(`/app/p/${projectSlug}/tasks`);
    revalidatePath(`/app/p/${projectSlug}/overview`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function transitionTaskAction(
  taskId: string,
  newStatus: TaskStatus,
  projectSlug: string,
  blockedReason?: string
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  try {
    await updateTask(user, taskId, {
      status: newStatus,
      blockedReason,
    });

    revalidatePath(`/app/p/${projectSlug}/tasks`);
    revalidatePath(`/app/p/${projectSlug}/overview`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function addChecklistAction(taskId: string, text: string, projectSlug: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  try {
    const item = await addChecklistItem(user, taskId, text);
    revalidatePath(`/app/p/${projectSlug}/tasks`);
    return { success: true, item };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function toggleChecklistAction(itemId: string, done: boolean, projectSlug: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  try {
    await toggleChecklistItem(user, itemId, done);
    revalidatePath(`/app/p/${projectSlug}/tasks`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function addCommentAction(taskId: string, body: string, projectSlug: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  try {
    const comment = await addTaskComment(user, taskId, body);
    revalidatePath(`/app/p/${projectSlug}/tasks`);
    return { success: true, comment };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function addDependencyAction(taskId: string, dependsOnTaskId: string, projectSlug: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  try {
    await addTaskDependency(user, taskId, dependsOnTaskId);
    revalidatePath(`/app/p/${projectSlug}/tasks`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
