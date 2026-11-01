import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { AppError, formatErrorResponse } from "@/server/lib/errors";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw AppError.unauthorized();
    }

    const key = `user_guide_state:${user.id}`.slice(0, 80);
    const setting = await prisma.systemSetting.findUnique({
      where: { key },
    });

    return NextResponse.json({
      data: {
        state: setting?.value ?? null,
      },
    });
  } catch (err) {
    const status = err instanceof AppError ? err.statusCode : 500;
    return NextResponse.json(formatErrorResponse(err), { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw AppError.unauthorized();
    }

    const body = await request.json();
    const state = body?.state;
    if (!state || typeof state !== "object") {
      throw AppError.badRequest("Invalid guide state payload");
    }

    const key = `user_guide_state:${user.id}`.slice(0, 80);
    const saved = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: state,
        updatedById: user.id,
      },
      create: {
        key,
        value: state,
        updatedById: user.id,
      },
    });

    return NextResponse.json({
      data: {
        state: saved.value,
      },
    });
  } catch (err) {
    const status = err instanceof AppError ? err.statusCode : 500;
    return NextResponse.json(formatErrorResponse(err), { status });
  }
}
