"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/session";
import {
  createFeedback,
  resolveFeedback,
  verifyFeedback,
  reopenFeedback,
} from "@/server/services/feedback";
import { FeedbackCategory, FeedbackSeverity, FeedbackTargetType } from "@/generated/prisma/enums";

export async function createFeedbackAction(
  projectId: string,
  projectSlug: string,
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const category = formData.get("category") as FeedbackCategory;
  const severity = formData.get("severity") as FeedbackSeverity;
  const assigneeId = (formData.get("assigneeId") as string) || null;

  try {
    await createFeedback(user, {
      projectId,
      title,
      body,
      category,
      severity,
      targetType: FeedbackTargetType.PROJECT,
      assigneeId,
    });

    revalidatePath(`/app/p/${projectSlug}/feedback`);
    revalidatePath(`/app/p/${projectSlug}/overview`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function resolveFeedbackAction(
  feedbackId: string,
  projectSlug: string,
  resolutionNote: string,
  evidenceUrl?: string
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  try {
    await resolveFeedback(user, feedbackId, resolutionNote, null, evidenceUrl);
    revalidatePath(`/app/p/${projectSlug}/feedback`);
    revalidatePath(`/app/p/${projectSlug}/overview`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function verifyFeedbackAction(
  feedbackId: string,
  projectSlug: string,
  note?: string
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  try {
    await verifyFeedback(user, feedbackId, note);
    revalidatePath(`/app/p/${projectSlug}/feedback`);
    revalidatePath(`/app/p/${projectSlug}/overview`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function reopenFeedbackAction(
  feedbackId: string,
  projectSlug: string,
  reason: string
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  try {
    await reopenFeedback(user, feedbackId, reason);
    revalidatePath(`/app/p/${projectSlug}/feedback`);
    revalidatePath(`/app/p/${projectSlug}/overview`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
