import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const token = String(body.token || "");
  const password = String(body.password || "");
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!row || row.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Reset token is invalid or expired" }, { status: 400 });
  }
  await prisma.user.update({
    where: { id: row.userId },
    data: { password: await hashPassword(password) },
  });
  await prisma.passwordResetToken.delete({ where: { id: row.id } });
  await writeAudit({ event: "PASSWORD_CHANGED", userId: row.userId, metadata: {} }).catch(() => {});
  return NextResponse.json({ success: true });
}
