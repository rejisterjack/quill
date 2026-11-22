import { NextResponse } from "next/server";
import { getCurrentUser, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo";

export async function DELETE() {
  if (isDemoMode()) {
    return NextResponse.json(
      { error: "Account deletion is disabled on the public demo." },
      { status: 403 },
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.workspace.deleteMany({ where: { ownerId: user.id } });
    await tx.user.delete({ where: { id: user.id } });
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
  return res;
}
