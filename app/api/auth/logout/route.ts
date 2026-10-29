import { NextResponse } from "next/server";
import { getCurrentUser, SESSION_COOKIE_NAME } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";

async function clearSession() {
  const user = await getCurrentUser();
  if (user) {
    await writeAudit({
      event: "USER_LOGOUT",
      userId: user.id,
      workspaceId: user.activeWorkspaceId,
      metadata: {},
    }).catch(() => {});
  }
  const res = NextResponse.json({ success: true, message: "Logged out successfully" });
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}

export async function POST() {
  return clearSession();
}

export async function GET() {
  const res = await clearSession();
  return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:7392"), {
    headers: res.headers,
  });
}
