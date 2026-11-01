import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { getFileBuffer } from "@/server/services/storage";
import { recordAuditLog } from "@/server/services/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: documentId } = await params;

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      currentVersion: true,
      project: {
        include: {
          members: { where: { userId: user.id, active: true } },
        },
      },
    },
  });

  if (!doc || !doc.currentVersion) {
    return NextResponse.json({ error: "Document or version not found" }, { status: 404 });
  }

  const project = doc.project;
  const isMember = project.members.length > 0;
  if (!isMember && user.systemRole !== "SYSTEM_ADMIN" && user.systemRole !== "DEPARTMENT_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const version = doc.currentVersion;

  if (version.scanStatus === "INFECTED") {
    return NextResponse.json(
      { error: "This file has been quarantined." },
      { status: 403 }
    );
  }

  try {
    const fileBuffer = await getFileBuffer(version.storageKey);

    await recordAuditLog({
      actorId: user.id,
      action: "DOCUMENT_DOWNLOADED",
      entityType: "Document",
      entityId: doc.id,
      projectId: project.id,
      metadata: { filename: version.originalName, versionNumber: version.versionNumber },
    });

    const headers = new Headers();
    headers.set("Content-Type", version.mimeType || "application/octet-stream");
    headers.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(version.originalName)}"`
    );
    headers.set("Content-Length", String(version.byteSize));

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve document file" },
      { status: 500 }
    );
  }
}

