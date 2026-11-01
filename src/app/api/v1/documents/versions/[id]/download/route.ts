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

  const { id: versionId } = await params;

  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
    include: {
      document: {
        include: {
          project: {
            include: {
              members: { where: { userId: user.id, active: true } },
            },
          },
        },
      },
    },
  });

  if (!version) {
    return NextResponse.json({ error: "Document version not found" }, { status: 404 });
  }

  const project = version.document.project;
  const isMember = project.members.length > 0;
  if (!isMember && user.systemRole !== "SYSTEM_ADMIN" && user.systemRole !== "DEPARTMENT_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (version.scanStatus === "INFECTED") {
    return NextResponse.json(
      { error: "This file has been quarantined due to security violations." },
      { status: 403 }
    );
  }

  try {
    const fileBuffer = await getFileBuffer(version.storageKey);

    await recordAuditLog({
      actorId: user.id,
      action: "DOCUMENT_DOWNLOADED",
      entityType: "DocumentVersion",
      entityId: version.id,
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

