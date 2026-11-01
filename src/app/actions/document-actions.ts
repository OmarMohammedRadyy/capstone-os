"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth/session";
import {
  createDocument,
  uploadDocumentVersion,
  markDocumentOfficial,
} from "@/server/services/documents";
import { DocumentCategory } from "@/generated/prisma/enums";

export async function createDocumentAction(
  projectId: string,
  projectSlug: string,
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const title = formData.get("title") as string;
  const category = formData.get("category") as DocumentCategory;
  const description = (formData.get("description") as string) || undefined;
  const tagsStr = (formData.get("tags") as string) || "";
  const tags = tagsStr.split(",").map((s) => s.trim()).filter(Boolean);

  try {
    await createDocument(user, {
      projectId,
      title,
      category,
      description,
      tags,
    });

    revalidatePath(`/app/p/${projectSlug}/documents`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function uploadDocumentVersionAction(
  documentId: string,
  projectSlug: string,
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const file = formData.get("file") as File;
  const note = (formData.get("note") as string) || undefined;

  if (!file || file.size === 0) {
    return { error: "Please select a valid file to upload." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await uploadDocumentVersion(
      user,
      documentId,
      buffer,
      file.name,
      file.type || "application/octet-stream",
      note
    );

    revalidatePath(`/app/p/${projectSlug}/documents`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function markOfficialAction(
  documentId: string,
  projectSlug: string,
  isOfficial: boolean
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");

  try {
    await markDocumentOfficial(user, documentId, isOfficial);
    revalidatePath(`/app/p/${projectSlug}/documents`);
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
