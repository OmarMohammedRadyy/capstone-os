"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/session";
import {
  approveMilestone,
  requestChangesMilestone,
  requestMilestoneApproval,
  addMilestoneEvidence,
} from "@/server/services/milestones";
import { FeedbackSeverity } from "@/generated/prisma/enums";

export async function approveMilestoneAction(milestoneId: string, projectSlug: string, comment?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  try {
    await approveMilestone(user, milestoneId, comment);
    revalidatePath(`/app/p/${projectSlug}/roadmap`);
    revalidatePath(`/app/p/${projectSlug}/overview`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function requestChangesMilestoneAction(
  milestoneId: string,
  projectSlug: string,
  reason: string,
  severity?: FeedbackSeverity
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  try {
    await requestChangesMilestone(user, milestoneId, reason, severity);
    revalidatePath(`/app/p/${projectSlug}/roadmap`);
    revalidatePath(`/app/p/${projectSlug}/feedback`);
    revalidatePath(`/app/p/${projectSlug}/overview`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function requestMilestoneApprovalAction(milestoneId: string, projectSlug: string, comment?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  try {
    await requestMilestoneApproval(user, milestoneId, comment);
    revalidatePath(`/app/p/${projectSlug}/roadmap`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function addEvidenceAction(
  milestoneId: string,
  projectSlug: string,
  url?: string,
  note?: string
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  try {
    await addMilestoneEvidence(user, milestoneId, null, url, note);
    revalidatePath(`/app/p/${projectSlug}/roadmap`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
