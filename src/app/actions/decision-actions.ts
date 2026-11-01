"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/session";
import { createDecision, supersedeDecision } from "@/server/services/decisions";

export async function createDecisionAction(
  projectId: string,
  projectSlug: string,
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const title = formData.get("title") as string;
  const context = formData.get("context") as string;
  const chosenOption = (formData.get("chosenOption") as string) || undefined;
  const rationale = (formData.get("rationale") as string) || undefined;
  const consequences = (formData.get("consequences") as string) || undefined;

  try {
    await createDecision(user, {
      projectId,
      title,
      context,
      chosenOption,
      rationale,
      consequences,
      decidedAt: new Date(),
    });

    revalidatePath(`/app/p/${projectSlug}/decisions`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

