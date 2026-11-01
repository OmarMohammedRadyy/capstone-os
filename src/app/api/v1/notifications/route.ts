import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { getUserNotifications } from "@/server/services/notifications";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unreadOnly = req.nextUrl.searchParams.get("unread") === "true";
  const notifications = await getUserNotifications(user.id, unreadOnly);

  return NextResponse.json({ data: notifications });
}

