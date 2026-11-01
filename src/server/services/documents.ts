import { prisma } from "@/server/db/prisma";
import { AppError } from "@/server/lib/errors";
import { recordAuditLog } from "@/server/services/audit";
import { storeFile } from "@/server/services/storage";
import { DocumentCategory, DocumentStatus, ScanStatus, ProjectRole } from "@/generated/prisma";
import type { User, Document, DocumentVersion } from "@/generated/prisma";

export interface CreateDocumentInput {
  projectId: string;
  title: string;
  category: DocumentCategory;
  description?: string;
  tags?: string[];
}

export async function createDocument(
  actor: User,
  input: CreateDocumentInput
): Promise<Document> {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: input.projectId, userId: actor.id } },
  });

  if (!member || !member.active) {
    if (actor.systemRole !== "SYSTEM_ADMIN") {
      throw AppError.forbidden("You must be an active project member to create documents.");
    }
  }

  const doc = await prisma.document.create({
    data: {
      projectId: input.projectId,
      title: input.title.trim(),
      category: input.category,
      description: input.description?.trim() || null,
      tags: input.tags || [],
      ownerId: actor.id,
      status: DocumentStatus.DRAFT,
    },
  });

  await prisma.activityEvent.create({
    data: {
      projectId: input.projectId,
      actorId: actor.id,
      type: "DOCUMENT_CREATED",
      entityType: "Document",
      entityId: doc.id,
      params: { title: doc.title, category: doc.category },
    },
  });

  return doc;
}

export async function uploadDocumentVersion(
  actor: User,
  documentId: string,
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  note?: string
): Promise<DocumentVersion> {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!doc) throw AppError.notFound("Document not found");

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: doc.projectId, userId: actor.id } },
  });

  if (!member || !member.active) {
    if (actor.systemRole !== "SYSTEM_ADMIN") {
      throw AppError.forbidden("Permission denied.");
    }
  }

  const nextVersionNumber = doc.versionSequence + 1;
  const destinationPrefix = `projects/${doc.projectId}/documents/${doc.id}`;

  const stored = await storeFile(buffer, originalName, mimeType, destinationPrefix);

  const version = await prisma.$transaction(async (tx) => {
    const v = await tx.documentVersion.create({
      data: {
        documentId: doc.id,
        versionNumber: nextVersionNumber,
        storageKey: stored.storageKey,
        originalName: stored.originalName,
        mimeType: stored.mimeType,
        byteSize: stored.byteSize,
        checksumSha256: stored.checksumSha256,
        note: note?.trim() || null,
        scanStatus: ScanStatus.CLEAN,
        uploadedById: actor.id,
      },
    });

    await tx.document.update({
      where: { id: doc.id },
      data: {
        currentVersionId: v.id,
        versionSequence: nextVersionNumber,
      },
    });

    await tx.activityEvent.create({
      data: {
        projectId: doc.projectId,
        actorId: actor.id,
        type: "DOCUMENT_VERSION_UPLOADED",
        entityType: "Document",
        entityId: doc.id,
        params: {
          title: doc.title,
          version: nextVersionNumber,
          filename: stored.originalName,
          size: stored.byteSize,
        },
      },
    });

    return v;
  });

  await recordAuditLog({
    actorId: actor.id,
    action: "DOCUMENT_VERSION_UPLOADED",
    entityType: "DocumentVersion",
    entityId: version.id,
    projectId: doc.projectId,
    metadata: {
      versionNumber: version.versionNumber,
      checksum: version.checksumSha256,
      size: version.byteSize,
    },
  });

  return version;
}

export async function markDocumentOfficial(
  actor: User,
  documentId: string,
  isOfficial: boolean
): Promise<Document> {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!doc) throw AppError.notFound("Document not found");

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: doc.projectId, userId: actor.id } },
  });

  if (
    (!member || (member.role !== ProjectRole.TEAM_LEADER && member.role !== ProjectRole.SUPERVISOR)) &&
    actor.systemRole !== "SYSTEM_ADMIN"
  ) {
    throw AppError.forbidden("Only Team Leaders or Supervisors can mark a document as official.");
  }

  const updated = await prisma.document.update({
    where: { id: documentId },
    data: {
      isOfficial,
      status: isOfficial ? DocumentStatus.APPROVED : DocumentStatus.DRAFT,
    },
  });

  await recordAuditLog({
    actorId: actor.id,
    action: isOfficial ? "DOCUMENT_MARKED_OFFICIAL" : "DOCUMENT_UNMARKED_OFFICIAL",
    entityType: "Document",
    entityId: doc.id,
    projectId: doc.projectId,
    before: { isOfficial: doc.isOfficial },
    after: { isOfficial },
  });

  return updated;
}

