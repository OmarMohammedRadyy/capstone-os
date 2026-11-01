import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { DEFAULT_EXPERIENCE_CONFIG } from "@/features/experience/content/default-experience-config";
import {
  deleteMediaAssetFromDraft,
  getPublishedExperienceConfig,
  getStudioPayload,
  publishExperienceDraft,
  resolveExperiencePermissions,
  rollbackExperienceToVersion,
  saveExperienceDraft,
  upsertMediaAssetInDraft,
} from "@/features/experience/server/experience-service";

async function resolveActorProjectRole(userId: string, projectSlug?: string | null) {
  if (!projectSlug) {
    const firstMember = await prisma.projectMember.findFirst({
      where: { userId, active: true },
      select: { role: true },
    });
    return firstMember?.role ?? null;
  }
  const project = await prisma.project.findFirst({
    where: { slug: projectSlug },
    select: { id: true },
  });
  if (!project) return null;
  const member = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: project.id,
        userId,
      },
    },
    select: { role: true, active: true },
  });
  return member?.active ? member.role : null;
}

export async function GET(request: NextRequest) {
  try {
    const mode = request.nextUrl.searchParams.get("mode") ?? "public";
    const projectSlug = request.nextUrl.searchParams.get("projectSlug");

    if (mode === "studio") {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
      }
      const projectRole = await resolveActorProjectRole(user.id, projectSlug);
      const studio = await getStudioPayload(user.systemRole, projectRole);
      return NextResponse.json(studio);
    }

    const published = await getPublishedExperienceConfig();
    return NextResponse.json({ published });
  } catch (error) {
    console.error("[GET /api/v1/experience]", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await request.json();
    const projectRole = await resolveActorProjectRole(user.id, body.projectSlug);
    const permissions = resolveExperiencePermissions(user.systemRole, projectRole);

    if (body.action === "UPSERT_MEDIA") {
      if (!permissions.includes("MEDIA_MANAGE") && !permissions.includes("BRANDING_EDIT")) {
        return NextResponse.json({ error: "FORBIDDEN_MEDIA_MANAGE" }, { status: 403 });
      }
      await upsertMediaAssetInDraft(body.asset, {
        id: user.id,
        fullName: user.name,
        email: user.email,
      });
      const studio = await getStudioPayload(user.systemRole, projectRole);
      return NextResponse.json(studio);
    }

    if (!permissions.includes("BRANDING_EDIT")) {
      return NextResponse.json({ error: "FORBIDDEN_BRANDING_EDIT" }, { status: 403 });
    }

    await saveExperienceDraft(body.draft, {
      id: user.id,
      fullName: user.name,
      email: user.email,
    });

    const studio = await getStudioPayload(user.systemRole, projectRole);
    return NextResponse.json(studio);
  } catch (error) {
    console.error("[PUT /api/v1/experience]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "SAVE_DRAFT_FAILED" },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await request.json();
    const projectRole = await resolveActorProjectRole(user.id, body.projectSlug);
    const permissions = resolveExperiencePermissions(user.systemRole, projectRole);

    const actor = {
      id: user.id,
      fullName: user.name,
      email: user.email,
    };

    if (body.action === "PUBLISH") {
      if (!permissions.includes("BRANDING_PUBLISH")) {
        return NextResponse.json({ error: "FORBIDDEN_BRANDING_PUBLISH" }, { status: 403 });
      }
      await publishExperienceDraft(actor, body.notes);
      const studio = await getStudioPayload(user.systemRole, projectRole);
      return NextResponse.json(studio);
    }

    if (body.action === "ROLLBACK") {
      if (!permissions.includes("BRANDING_PUBLISH")) {
        return NextResponse.json({ error: "FORBIDDEN_BRANDING_PUBLISH" }, { status: 403 });
      }
      await rollbackExperienceToVersion(body.versionId, actor);
      const studio = await getStudioPayload(user.systemRole, projectRole);
      return NextResponse.json(studio);
    }

    if (body.action === "RESET_DEFAULT") {
      if (!permissions.includes("BRANDING_EDIT")) {
        return NextResponse.json({ error: "FORBIDDEN_BRANDING_EDIT" }, { status: 403 });
      }
      await saveExperienceDraft(structuredClone(DEFAULT_EXPERIENCE_CONFIG), actor);
      const studio = await getStudioPayload(user.systemRole, projectRole);
      return NextResponse.json(studio);
    }

    if (body.action === "DELETE_MEDIA") {
      if (!permissions.includes("MEDIA_MANAGE")) {
        return NextResponse.json({ error: "FORBIDDEN_MEDIA_MANAGE" }, { status: 403 });
      }
      await deleteMediaAssetFromDraft(body.assetId, actor);
      const studio = await getStudioPayload(user.systemRole, projectRole);
      return NextResponse.json(studio);
    }

    return NextResponse.json({ error: "UNKNOWN_ACTION" }, { status: 400 });
  } catch (error) {
    console.error("[POST /api/v1/experience]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "OPERATION_FAILED" },
      { status: 400 }
    );
  }
}
