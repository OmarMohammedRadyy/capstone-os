"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/session";
import { AppError } from "@/server/lib/errors";
import {
  updateDefensePlanDetails,
  addDefenseSection,
  toggleDefenseChecklistItem,
  addDefenseQuestion,
} from "@/server/services/defense";

export async function updateDefensePlanAction(
  projectId: string,
  projectSlug: string,
  defenseAt?: string | null,
  location?: string | null,
  demoScript?: string | null,
  backupPlan?: string | null,
  buildUrl?: string | null
) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  await updateDefensePlanDetails(
    user,
    projectId,
    defenseAt,
    location,
    demoScript,
    backupPlan,
    buildUrl
  );

  revalidatePath(`/app/p/${projectSlug}/defense`);
  return { success: true };
}

export async function addDefenseSectionAction(
  projectId: string,
  projectSlug: string,
  title: string,
  ownerId?: string | null,
  durationMinutes: number = 3,
  notes?: string | null
) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  const section = await addDefenseSection(
    user,
    projectId,
    title,
    ownerId,
    durationMinutes,
    notes
  );

  revalidatePath(`/app/p/${projectSlug}/defense`);
  return { success: true, section };
}

export async function toggleChecklistItemAction(
  itemId: string,
  done: boolean,
  projectSlug: string
) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  const item = await toggleDefenseChecklistItem(user, itemId, done);
  revalidatePath(`/app/p/${projectSlug}/defense`);
  return { success: true, item };
}

export async function addDefenseQuestionAction(
  projectId: string,
  projectSlug: string,
  question: string,
  answerNotes?: string | null,
  ownerId?: string | null
) {
  const user = await getCurrentUser();
  if (!user) throw AppError.unauthorized("Authentication required");

  const q = await addDefenseQuestion(user, projectId, question, answerNotes, ownerId);
  revalidatePath(`/app/p/${projectSlug}/defense`);
  return { success: true, question: q };
}

