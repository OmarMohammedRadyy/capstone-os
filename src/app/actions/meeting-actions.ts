"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/session";
import {
  createMeeting,
  updateMeetingMinutes,
  addMeetingAction,
  convertActionToTask,
} from "@/server/services/meetings";
import { MeetingType, MeetingStatus } from "@/generated/prisma/enums";

export async function createMeetingAction(
  projectId: string,
  projectSlug: string,
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const title = formData.get("title") as string;
  const type = formData.get("type") as MeetingType;
  const scheduledAt = formData.get("scheduledAt") as string;
  const duration = Number(formData.get("durationMinutes")) || 60;
  const location = (formData.get("location") as string) || null;
  const agenda = (formData.get("agenda") as string) || null;

  try {
    await createMeeting(user, {
      projectId,
      title,
      type,
      scheduledAt,
      durationMinutes: duration,
      location,
      agenda,
    });

    revalidatePath(`/app/p/${projectSlug}/meetings`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function convertActionToTaskAction(actionId: string, projectSlug: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  try {
    await convertActionToTask(user, actionId);
    revalidatePath(`/app/p/${projectSlug}/meetings`);
    revalidatePath(`/app/p/${projectSlug}/tasks`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function addMeetingActionItemAction(
  meetingId: string,
  projectSlug: string,
  text: string,
  ownerId?: string
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  try {
    await addMeetingAction(user, meetingId, text, ownerId);
    revalidatePath(`/app/p/${projectSlug}/meetings`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
