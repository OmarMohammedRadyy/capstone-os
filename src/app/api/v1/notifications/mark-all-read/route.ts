import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { markAllNotificationsAsRead } from "@/server/services/notifications";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await markAllNotificationsAsRead(user.id);
  return NextResponse.json({ success: true });
}

