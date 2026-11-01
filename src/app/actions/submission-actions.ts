"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/session";
import { AppError } from "@/server/lib/errors";
import {
  createSubmission,
  completeRequirement,
  freezeSubmission,
  unfreezeSubmission,
  CreateSubmissionInput,
} from "@/server/services/submissions";

export async function createSubmissionAction(input: CreateSubmissionInput, projectSlug: string) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  const submission = await createSubmission(user, input);
  revalidatePath(`/app/p/${projectSlug}/submissions`);
  return { success: true, submission };
}

export async function completeRequirementAction(
  requirementId: string,
  completed: boolean,
  documentVersionId: string | null | undefined,
  url: string | null | undefined,
  projectSlug: string
) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  const requirement = await completeRequirement(
    user,
    requirementId,
    completed,
    documentVersionId,
    url
  );
  revalidatePath(`/app/p/${projectSlug}/submissions`);
  return { success: true, requirement };
}

export async function freezeSubmissionAction(submissionId: string, projectSlug: string) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  try {
    const snapshot = await freezeSubmission(user, submissionId);
    revalidatePath(`/app/p/${projectSlug}/submissions`);
    return { success: true, snapshot };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to freeze submission package" };
  }
}

export async function unfreezeSubmissionAction(
  submissionId: string,
  reason: string,
  projectSlug: string
) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  try {
    const submission = await unfreezeSubmission(user, submissionId, reason);
    revalidatePath(`/app/p/${projectSlug}/submissions`);
    return { success: true, submission };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to unfreeze deliverable" };
  }
}

