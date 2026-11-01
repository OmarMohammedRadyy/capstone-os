"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/session";
import { createRisk, updateRiskStatus, createIssue, resolveIssue } from "@/server/services/risks";
import { RiskCategory, RiskStatus, IssueSeverity } from "@/generated/prisma/enums";

export async function createRiskAction(
  projectId: string,
  projectSlug: string,
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || undefined;
  const category = (formData.get("category") as RiskCategory) || RiskCategory.OTHER;
  const probability = Number(formData.get("probability")) || 3;
  const impact = Number(formData.get("impact")) || 3;
  const mitigation = (formData.get("mitigation") as string) || undefined;
  const contingency = (formData.get("contingency") as string) || undefined;

  try {
    await createRisk(user, {
      projectId,
      title,
      description,
      category,
      probability,
      impact,
      mitigation,
      contingency,
    });

    revalidatePath(`/app/p/${projectSlug}/risks`);
    revalidatePath(`/app/p/${projectSlug}/overview`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function createIssueAction(
  projectId: string,
  projectSlug: string,
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || undefined;
  const severity = (formData.get("severity") as IssueSeverity) || IssueSeverity.MEDIUM;
  const isBlocker = formData.get("isBlocker") === "true";
  const rootCause = (formData.get("rootCause") as string) || undefined;

  try {
    await createIssue(user, {
      projectId,
      title,
      description,
      severity,
      isBlocker,
      rootCause,
    });

    revalidatePath(`/app/p/${projectSlug}/risks`);
    revalidatePath(`/app/p/${projectSlug}/overview`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
