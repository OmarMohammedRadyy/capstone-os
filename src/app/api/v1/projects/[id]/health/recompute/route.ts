import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { calculateProjectHealth } from "@/server/services/health";
import { prisma } from "@/server/db/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });

  if (!member && user.systemRole !== "SYSTEM_ADMIN" && user.systemRole !== "DEPARTMENT_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const health = await calculateProjectHealth(projectId, "MANUAL");

  return NextResponse.json({ data: health });
}
