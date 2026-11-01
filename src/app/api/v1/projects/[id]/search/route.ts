import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { searchProject } from "@/server/services/search";
import { prisma } from "@/server/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const slug = searchParams.get("slug");

  // Check access to project
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });

  if (!member && user.systemRole !== "SYSTEM_ADMIN" && user.systemRole !== "DEPARTMENT_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let projectSlug = slug;
  if (!projectSlug) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { slug: true },
    });
    projectSlug = project?.slug || "";
  }

  const results = await searchProject(projectId, projectSlug, q);

  return NextResponse.json({ data: results });
}

